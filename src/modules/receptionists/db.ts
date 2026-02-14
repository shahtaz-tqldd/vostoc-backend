import { prisma } from "../../helpers/prisma";
import type { Prisma } from "@prisma/client";

export const findDepartmentsByIds = (departmentIds: string[]) => {
  return prisma.department.findMany({
    where: {
      id: {
        in: departmentIds
      }
    }
  });
};

export const findReceptionistDepartmentIdsByUserId = async (userId: string) => {
  try {
    const receptionist = await prisma.receptionist.findUnique({
      where: { userId },
      select: {
        departments: {
          select: {
            id: true
          }
        }
      }
    });

    return receptionist?.departments.map((department) => department.id) ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    // Backward compatibility while DB migration for Receptionist.userId is pending.
    if (!message.includes("Receptionist.userId")) {
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    if (!user?.name) {
      return [];
    }

    const receptionist = await prisma.receptionist.findFirst({
      where: { name: user.name },
      select: {
        departments: {
          select: {
            id: true
          }
        }
      }
    });

    return receptionist?.departments.map((department) => department.id) ?? [];
  }
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
      { departments: { some: { name: { contains: search, mode } } } }
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
      departments: true
    }
  });
};

export const countReceptionists = (input: { search?: string }) => {
  return prisma.receptionist.count({
    where: buildReceptionistSearchFilter(input.search)
  });
};
