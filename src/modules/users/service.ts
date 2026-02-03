import type { Role } from "@prisma/client";
import { hashPassword } from "../../helpers/password";
import { createUser, findUserById, listUsers } from "./db";

export const getMeService = async (userId: string) => {
  return findUserById(userId);
};

export const createUserService = async (input: {
  username: string;
  email?: string;
  phone?: string;
  name: string;
  password: string;
  role: Role;
}) => {
  const passwordHash = await hashPassword(input.password);
  return createUser({
    username: input.username,
    email: input.email || null,
    phone: input.phone || null,
    name: input.name,
    passwordHash,
    role: input.role
  });
};

export const listUsersService = async () => {
  return listUsers();
};
