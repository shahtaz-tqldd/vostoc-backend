import { createDepartment, createSpecialty, deleteDepartment, listDepartments, listSpecialties } from "./db";
import { findReceptionistDepartmentIdsByUserId } from "../receptionists/db";

export const listDepartmentsService = async (user: { id: string; role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" }) => {
  if (user.role !== "RECEPTIONIST") {
    return listDepartments();
  }

  const departmentIds = await findReceptionistDepartmentIdsByUserId(user.id);
  if (departmentIds.length === 0) {
    return [];
  }

  return listDepartments(departmentIds);
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
