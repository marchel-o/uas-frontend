import bcrypt from "bcryptjs";
import type { SeedClient } from "./client";

export async function seedUsers(prisma: SeedClient) {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  return prisma.user.upsert({
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
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    },
  });
}
