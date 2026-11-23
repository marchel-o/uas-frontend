
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL_UNPOOLED!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      name: "Administrator",
      username: "admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin berhasil dibuat!");
  console.log({
    id: admin.id,
    name: admin.name,
    username: admin.username,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error("Seeder gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
