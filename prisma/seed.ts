import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

const PREFIX = "SEED-";

const CATEGORIES = ["Makanan", "Minuman", "Snack"];

const PRODUCTS = [
  { name: "Nasi Goreng", category: "Makanan", price: 20000 },
  { name: "Mie Ayam", category: "Makanan", price: 15000 },
  { name: "Ayam Geprek", category: "Makanan", price: 18000 },
  { name: "Roti Bakar", category: "Makanan", price: 12000 },
  { name: "Es Teh", category: "Minuman", price: 5000 },
  { name: "Kopi Susu", category: "Minuman", price: 15000 },
  { name: "Jus Jeruk", category: "Minuman", price: 12000 },
  { name: "Air Mineral", category: "Minuman", price: 4000 },
  { name: "Keripik Singkong", category: "Snack", price: 8000 },
  { name: "Kacang Goreng", category: "Snack", price: 7000 },
  { name: "Biskuit", category: "Snack", price: 6000 },
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

  const mine = { transaction: { invoice: { startsWith: PREFIX } } };
  await prisma.payment.deleteMany({ where: mine });
  await prisma.transactionItem.deleteMany({ where: mine });
  await prisma.transaction.deleteMany({ where: { invoice: { startsWith: PREFIX } } });

  const categoryId = new Map<string, number>();
  for (const name of CATEGORIES) {
    const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    categoryId.set(name, c.id);
  }

  const products: { id: number; price: number }[] = [];
  for (const [i, p] of PRODUCTS.entries()) {
    let product = await prisma.product.findFirst({ where: { name: p.name } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          sku: `SEED-${String(i + 1).padStart(3, "0")}`,
          name: p.name,
          price: p.price,
          stock: 100,
          categoryId: categoryId.get(p.category)!,
        },
      });
    }
    products.push({ id: product.id, price: product.price.toNumber() });
  }

  // 4. Kasir: pakai user pertama yang ada, buat satu kalau belum ada
  let user = await prisma.user.findFirst({ orderBy: { id: "asc" } });
  if (!user) {
    user = await prisma.user.create({
      data: { name: "Kasir Contoh", username: "kasir", password: "kasir123" },
    });
  }

  const rand = seeded(2026);
  let n = 1;
  let created = 0;

  for (let date = addDays(today, -45); date <= today; date = addDays(date, 1)) {
    const count = 3 + Math.floor(rand() * 6);
    const times: string[] = [];
    for (let i = 0; i < count; i++) {
      const h = 8 + Math.floor(rand() * 13);
      const m = Math.floor(rand() * 60);
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    times.sort();

    for (const time of times) {
      const itemCount = 1 + Math.floor(rand() * 3);
      const picked = new Set<number>();
      while (picked.size < itemCount) picked.add(Math.floor(rand() * products.length));

      const rows = Array.from(picked).map((idx) => {
        const quantity = 1 + Math.floor(rand() * 3);
        const price = products[idx].price;
        return { productId: products[idx].id, quantity, price, subtotal: quantity * price };
      });

      const total = rows.reduce((s, r) => s + r.subtotal, 0);
      const amountPaid = Math.ceil(total / 10000) * 10000;
      const createdAt = new Date(`${date}T${time}:00+07:00`);

      await prisma.transaction.create({
        data: {
          invoice: `${PREFIX}${String(n++).padStart(3, "0")}`,
          userId: user.id,
          total,
          createdAt,
          items: { create: rows },
          payment: {
            create: { method: "Tunai", amountPaid, change: amountPaid - total, createdAt },
          },
        },
      });
      created++;
    }
  }

  console.log(`Seed selesai: ${CATEGORIES.length} kategori, ${PRODUCTS.length} produk, ${created} transaksi`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());