import { prisma } from "./client";
import { seedUsers } from "./seed-users";
import { seedCategories } from "./seed-categories";
import { seedProducts } from "./seed-products";
import { seedTransactions } from "./seed-transactions";

async function main() {
  const user = await seedUsers(prisma);

  const categoryMap = await seedCategories(prisma);
  const productMap = await seedProducts(prisma, categoryMap);
  const transactionResult = await seedTransactions(prisma, user.id, productMap);

  console.log({
    kasir: user.username,
    kategori: categoryMap.size,
    produk: productMap.size,
    transaksiBaru: transactionResult.created,
    transaksiDilewati: transactionResult.skipped,
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
