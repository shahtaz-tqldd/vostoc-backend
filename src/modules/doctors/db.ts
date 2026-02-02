import { prisma } from "../../helpers/prisma";
import type { Weekday } from "@prisma/client";

export type DoctorScheduleInput = {
  day: Weekday;
  startTime: string;
  endTime: string;
};

export const findDepartmentById = (departmentId: string) => {
  return prisma.department.findUnique({ where: { id: departmentId } });
};

export const findSpecialtyByName = (input: { departmentId: string; specialtyName: string }) => {
  return prisma.specialty.findFirst({
    where: {
      departmentId: input.departmentId,
      name: {
        equals: input.specialtyName,
        mode: "insensitive"
      }
    }
  });
};

export const createDoctor = (input: {
  name: string;
  departmentId: string;
  specialtyId: string;
  contactNumber: string;
  description?: string;
  profileImageUrl?: string;
  schedules: DoctorScheduleInput[];
}) => {
  return prisma.doctor.create({
    data: {
      name: input.name,
      departmentId: input.departmentId,
      specialtyId: input.specialtyId,
      contactNumber: input.contactNumber,
      description: input.description,
      profileImageUrl: input.profileImageUrl,
      schedules: input.schedules.length > 0 ? { createMany: { data: input.schedules } } : undefined
    },
    include: {
      department: true,
      specialty: true,
      schedules: {
        orderBy: [{ day: "asc" }, { startTime: "asc" }]
      }
    }
  });
};

export const listDoctors = () => {
  return prisma.doctor.findMany({
    orderBy: { name: "asc" },
    include: {
      department: true,
      specialty: true,
      schedules: {
        orderBy: [{ day: "asc" }, { startTime: "asc" }]
      }
    }
  });
};
