import { prisma } from "../../helpers/prisma";

export const listDepartments = (departmentIds?: string[]) => {
  return prisma.department.findMany({
    where:
      departmentIds && departmentIds.length > 0
        ? {
            id: {
              in: departmentIds
            }
          }
        : undefined,
    orderBy: { name: "asc" },
    include: { specialties: { orderBy: { name: "asc" } } }
  });
};

export const createDepartment = (input: { name: string; specialties?: string[] }) => {
  const specialties = (input.specialties || []).filter((s) => s.trim().length > 0);

  return prisma.department.create({
    data: {
      name: input.name,
      specialties: specialties.length > 0 ? { createMany: { data: specialties.map((name) => ({ name })) } } : undefined
    },
    include: { specialties: { orderBy: { name: "asc" } } }
  });
};

export const deleteDepartment = async (input: { departmentId: string }) => {
  await prisma.specialty.deleteMany({ where: { departmentId: input.departmentId } });
  return prisma.department.delete({
    where: { id: input.departmentId }
  });
};

export const listSpecialties = (departmentId: string) => {
  return prisma.specialty.findMany({
    where: { departmentId },
    orderBy: { name: "asc" }
  });
};

export const createSpecialty = (input: { name: string; departmentId: string }) => {
  return prisma.specialty.create({ data: input });
};
