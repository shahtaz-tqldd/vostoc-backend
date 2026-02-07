import type { Role } from "@prisma/client";
import { hashPassword } from "../../helpers/password";
import { prisma } from "../../helpers/prisma";
import { uploadImageToCloudinary } from "../../helpers/cloudinary";
import { countReceptionists, findDepartmentById, listReceptionists } from "./db";

export const createReceptionistService = async (input: {
  name: string;
  departmentId: string;
  contactNumber: string;
  shift: string;
  description?: string;
  image?: Express.Multer.File;
  username: string;
  password: string;
}) => {
  const department = await findDepartmentById(input.departmentId);
  if (!department) {
    throw new Error("Department not found");
  }

  let profileImageUrl: string | undefined;
  if (input.image) {
    profileImageUrl = await uploadImageToCloudinary({
      buffer: input.image.buffer,
      filename: input.image.originalname,
      mimetype: input.image.mimetype
    });
  }

  const passwordHash = await hashPassword(input.password);
  const receptionistRole: Role = "RECEPTIONIST";

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: input.username,
        name: input.name,
        passwordHash,
        role: receptionistRole
      }
    });

    const receptionist = await tx.receptionist.create({
      data: {
        name: input.name,
        departmentId: input.departmentId,
        contactNumber: input.contactNumber,
        shift: input.shift,
        description: input.description,
        profileImageUrl
      },
      include: {
        department: true
      }
    });

    return {
      ...receptionist,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    };
  });
};

export const listReceptionistsService = async (input: { page: number; pageSize: number; search?: string }) => {
  const skip = (input.page - 1) * input.pageSize;
  const [data, total] = await Promise.all([
    listReceptionists({ skip, take: input.pageSize, search: input.search }),
    countReceptionists({ search: input.search })
  ]);

  return {
    data,
    meta: {
      page: input.page,
      pageSize: input.pageSize,
      total
    }
  };
};
