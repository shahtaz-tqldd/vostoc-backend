import type { Role, Weekday } from "@prisma/client";
import { hashPassword } from "../../helpers/password";
import { prisma } from "../../helpers/prisma";
import { uploadImageToCloudinary } from "../../helpers/cloudinary";
import { createDoctor, findDepartmentById, findSpecialtyByName, listDoctors } from "./db";

const dayMap: Record<string, Weekday> = {
  mon: "MON",
  tue: "TUE",
  wed: "WED",
  thu: "THU",
  fri: "FRI",
  sat: "SAT",
  sun: "SUN"
};

type TimeSlotInput = {
  start_time?: string;
  end_time?: string;
};

type ScheduleItemInput = Record<string, TimeSlotInput[]>;

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const normalizeSchedules = (schedules: ScheduleItemInput[]) => {
  if (!Array.isArray(schedules)) {
    throw new Error("schedules must be an array");
  }

  const normalized: { day: Weekday; startTime: string; endTime: string }[] = [];

  for (const entry of schedules) {
    for (const [rawDay, slots] of Object.entries(entry)) {
      const day = dayMap[rawDay.trim().slice(0, 3).toLowerCase()];
      if (!day) {
        throw new Error(`Invalid day '${rawDay}'. Use Mon/Tue/Wed/Thu/Fri/Sat/Sun.`);
      }

      for (const slot of slots) {
        const startTime = slot.start_time || "";
        const endTime = slot.end_time || "";

        if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
          throw new Error(`Invalid time range '${startTime} - ${endTime}'. Use HH:mm format.`);
        }

        if (startTime >= endTime) {
          throw new Error(`start_time must be before end_time for ${rawDay}.`);
        }

        normalized.push({ day, startTime, endTime });
      }
    }
  }

  return normalized;
};

export const createDoctorService = async (input: {
  name: string;
  departmentId: string;
  specialty: string;
  contactNumber: string;
  description?: string;
  schedules?: ScheduleItemInput[];
  image?: Express.Multer.File;
  username?: string;
  password?: string;
}) => {
  const department = await findDepartmentById(input.departmentId);
  if (!department) {
    throw new Error("Department not found");
  }

  const specialty = await findSpecialtyByName({
    departmentId: input.departmentId,
    specialtyName: input.specialty
  });

  if (!specialty) {
    throw new Error("Specialty not found in the given department");
  }

  let profileImageUrl: string | undefined;
  if (input.image) {
    profileImageUrl = await uploadImageToCloudinary({
      buffer: input.image.buffer,
      filename: input.image.originalname,
      mimetype: input.image.mimetype
    });
  }

  const schedules = normalizeSchedules(input.schedules || []);

  if ((input.username && !input.password) || (!input.username && input.password)) {
    throw new Error("username and password must be provided together");
  }

  if (!input.username) {
    return createDoctor({
      name: input.name,
      departmentId: input.departmentId,
      specialtyId: specialty.id,
      contactNumber: input.contactNumber,
      description: input.description,
      profileImageUrl,
      schedules
    });
  }

  const passwordHash = await hashPassword(input.password!);
  const doctorRole: Role = "DOCTOR";

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: input.username!,
        name: input.name,
        passwordHash,
        role: doctorRole
      }
    });

    const doctor = await tx.doctor.create({
      data: {
        name: input.name,
        departmentId: input.departmentId,
        specialtyId: specialty.id,
        contactNumber: input.contactNumber,
        description: input.description,
        profileImageUrl,
        schedules: schedules.length > 0 ? { createMany: { data: schedules } } : undefined
      },
      include: {
        department: true,
        specialty: true,
        schedules: {
          orderBy: [{ day: "asc" }, { startTime: "asc" }]
        }
      }
    });

    return {
      ...doctor,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    };
  });
};

export const listDoctorsService = async () => {
  return listDoctors();
};
