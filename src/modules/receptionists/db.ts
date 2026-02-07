import { prisma } from "../../helpers/prisma";
import type { Prisma } from "@prisma/client";

export const findDepartmentById = (departmentId: string) => {
  return prisma.department.findUnique({ where: { id: departmentId } });
};

const buildReceptionistSearchFilter = (search?: string): Prisma.ReceptionistWhereInput => {
  if (!search) {
    return {};
  }

  const mode: Prisma.QueryMode = "insensitive";

  return {
    OR: [
      { name: { contains: search, mode } },
      { contactNumber: { contains: search, mode } },
      { department: { name: { contains: search, mode } } }
    ]
  };
};

export const listReceptionists = (input: { skip: number; take: number; search?: string }) => {
  return prisma.receptionist.findMany({
    where: buildReceptionistSearchFilter(input.search),
    skip: input.skip,
    take: input.take,
    orderBy: { name: "asc" },
    include: {
      department: true
    }
  });
};

export const countReceptionists = (input: { search?: string }) => {
  return prisma.receptionist.count({
    where: buildReceptionistSearchFilter(input.search)
  });
};
