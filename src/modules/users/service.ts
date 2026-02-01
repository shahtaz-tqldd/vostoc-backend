import type { Role } from "@prisma/client";
import { hashPassword } from "../../helpers/password";
import { createUser, findUserById, listUsers } from "./db";

export const getMeService = async (userId: string) => {
  return findUserById(userId);
};

export const createUserService = async (input: {
  email: string;
  name: string;
  password: string;
  role: Role;
}) => {
  const passwordHash = await hashPassword(input.password);
  return createUser({ email: input.email, name: input.name, passwordHash, role: input.role });
};

export const listUsersService = async () => {
  return listUsers();
};
