import { prisma } from "../src/helpers/prisma";
import { hashPassword } from "../src/helpers/password";

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminEmail = process.env.ADMIN_EMAIL || "admin@vostoc.local";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const adminName = process.env.ADMIN_NAME || "Admin";

const main = async () => {
  const passwordHash = await hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      name: adminName,
      passwordHash,
      role: "ADMIN"
    },
    create: {
      username: adminUsername,
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: "ADMIN"
    }
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
