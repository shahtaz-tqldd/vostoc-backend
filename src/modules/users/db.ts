import { prisma } from "../../helpers/prisma";
import type { Role } from "@prisma/client";

export const findUserById = (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = (data: {
  username: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  passwordHash: string;
  role: Role;
}) => {
  return prisma.user.create({ data });
};

export const listUsers = () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, email: true, phone: true, name: true, role: true, createdAt: true }
  });
};
