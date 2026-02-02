import { createDepartment, createSpecialty, deleteDepartment, listDepartments, listSpecialties } from "./db";

export const listDepartmentsService = async () => {
  return listDepartments();
};

export const createDepartmentService = async (input: { name: string; specialties?: string[] }) => {
  return createDepartment(input);
};

export const deleteDepartmentService = async (input: { departmentId: string }) => {
  return deleteDepartment(input);
};

export const listSpecialtiesService = async (departmentId: string) => {
  return listSpecialties(departmentId);
};

export const createSpecialtyService = async (input: { name: string; departmentId: string }) => {
  return createSpecialty(input);
};
