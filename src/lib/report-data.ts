import { prisma } from "@/lib/prisma";
import type { Transaction } from "@/app/main/laporan/data";

export async function getReportData() {
  const rows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { include: { category: true } } } } },
  });

  const transactions: Transaction[] = rows.map((t) => {
    const wib = new Date(t.createdAt.getTime() + 7 * 3600 * 1000).toISOString();
    return {
      id: t.invoice,
      date: wib.slice(0, 10),
      time: wib.slice(11, 16),
      items: t.items.map((i) => ({
        product: i.product.name,
        category: i.product.category.name,
        qty: i.quantity,
        price: Number(i.price),
      })),
    };
  });

  const categories = (await prisma.category.findMany({ orderBy: { name: "asc" } })).map((c) => c.name);

  return { transactions, categories };
}