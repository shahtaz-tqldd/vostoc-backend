import { prisma } from "../../helpers/prisma";

export const findUserByIdentifier = (identifier: string) => {
  return prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }, { phone: identifier }]
    }
  });
};
