import type { SeedClient } from "./client";

export const categories = [
  "Minuman",
  "Makanan Instan",
  "Makanan Ringan",
  "Kebutuhan Dapur",
  "Perawatan Diri",
  "Kebersihan Rumah",
  "Obat & Kesehatan",
];

export async function seedCategories(prisma: SeedClient) {
  const categoryMap = new Map<string, number>();

  for (const name of categories) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });

    categoryMap.set(name, category.id);
  }

  return categoryMap;
}
