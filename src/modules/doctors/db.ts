import { prisma } from "../../helpers/prisma";
import type { Weekday, Prisma } from "@prisma/client";

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

const buildDoctorSearchFilter = (search?: string): Prisma.DoctorWhereInput => {
  if (!search) {
    return {};
  }

  const mode: Prisma.QueryMode = "insensitive";

  return {
    OR: [
      { name: { contains: search, mode } },
      { contactNumber: { contains: search, mode } },
      { department: { name: { contains: search, mode } } },
      { specialty: { name: { contains: search, mode } } }
    ]
  };
};

export const listDoctors = (input: { skip: number; take: number; search?: string }) => {
  return prisma.doctor.findMany({
    where: buildDoctorSearchFilter(input.search),
    skip: input.skip,
    take: input.take,
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

export const countDoctors = (input: { search?: string }) => {
  return prisma.doctor.count({
    where: buildDoctorSearchFilter(input.search)
  });
};
