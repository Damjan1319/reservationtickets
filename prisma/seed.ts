import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "damjan@ulaznice.rs").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (password.length < 6) {
    throw new Error("Set ADMIN_PASSWORD in .env before seeding.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name: "Damjan", passwordHash, isAdmin: true },
    create: { email, name: "Damjan", passwordHash, isAdmin: true },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
