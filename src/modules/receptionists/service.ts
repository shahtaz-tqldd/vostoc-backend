import type { Role } from "@prisma/client";
import { hashPassword } from "../../helpers/password";
import { prisma } from "../../helpers/prisma";
import { uploadImageToCloudinary } from "../../helpers/cloudinary";
import { countReceptionists, findDepartmentsByIds, listReceptionists } from "./db";

export const createReceptionistService = async (input: {
  name: string;
  departmentIds: string[];
  contactNumber: string;
  shift: string;
  description?: string;
  image?: Express.Multer.File;
  username: string;
  password: string;
}) => {
  const uniqueDepartmentIds = [...new Set(input.departmentIds)];
  const departments = await findDepartmentsByIds(uniqueDepartmentIds);
  if (departments.length !== uniqueDepartmentIds.length) {
    throw new Error("One or more departments were not found");
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
        userId: user.id,
        name: input.name,
        contactNumber: input.contactNumber,
        shift: input.shift,
        description: input.description,
        profileImageUrl,
        departments: {
          connect: uniqueDepartmentIds.map((departmentId) => ({ id: departmentId }))
        }
      },
      include: {
        departments: true
      }
    });

    return {
      id: receptionist.id,
      name: receptionist.name,
      contactNumber: receptionist.contactNumber,
      shift: receptionist.shift,
      description: receptionist.description,
      profileImageUrl: receptionist.profileImageUrl,
      createdAt: receptionist.createdAt,
      updatedAt: receptionist.updatedAt,
      departmentIds: receptionist.departments.map((item) => item.id),
      departments: receptionist.departments,
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
    data: data.map((receptionist) => ({
      id: receptionist.id,
      name: receptionist.name,
      contactNumber: receptionist.contactNumber,
      shift: receptionist.shift,
      description: receptionist.description,
      profileImageUrl: receptionist.profileImageUrl,
      createdAt: receptionist.createdAt,
      updatedAt: receptionist.updatedAt,
      departmentIds: receptionist.departments.map((item) => item.id),
      departments: receptionist.departments
    })),
    meta: {
      page: input.page,
      pageSize: input.pageSize,
      total
    }
  };
};
