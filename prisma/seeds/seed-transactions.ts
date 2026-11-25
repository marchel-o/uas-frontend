import type { SeedClient } from "./client";

type SeedTransaction = {
  invoice: string;
  method: string;
  items: { sku: string; quantity: number }[];
};

export const transactions: SeedTransaction[] = [
  {
    invoice: "INV-SEED-001",
    method: "cash",
    items: [
      { sku: "8991554352191", quantity: 3 },
      { sku: "8991079193170", quantity: 2 },
    ],
  },
  {
    invoice: "INV-SEED-002",
    method: "debit",
    items: [
      { sku: "8991158386349", quantity: 1 },
      { sku: "8991237579518", quantity: 2 },
    ],
  },
  {
    invoice: "INV-SEED-003",
    method: "cash",
    items: [
      { sku: "8991633545360", quantity: 2 },
      { sku: "8992821442911", quantity: 1 },
    ],
  },
  {
    invoice: "INV-SEED-004",
    method: "debit",
    items: [
      { sku: "8991871124877", quantity: 1 },
      { sku: "8992029511211", quantity: 1 },
    ],
  },
  {
    invoice: "INV-SEED-005",
    method: "cash",
    items: [
      { sku: "8992187897554", quantity: 1 },
      { sku: "8992267090721", quantity: 1 },
    ],
  },
  {
    invoice: "INV-SEED-006",
    method: "cash",
    items: [
      { sku: "8992425477067", quantity: 1 },
      { sku: "8992663056574", quantity: 1 },
    ],
  },
  {
    invoice: "INV-SEED-007",
    method: "cash",
    items: [
      { sku: "8991712738539", quantity: 2 },
      { sku: "8991950318043", quantity: 1 },
    ],
  },
  {
    invoice: "INV-SEED-008",
    method: "debit",
    items: [{ sku: "8992742249743", quantity: 1 }],
  },
];

function roundRupiah(value: number) {
  return Math.round(value * 100) / 100;
}

export async function seedTransactions(
  prisma: SeedClient,
  userId: number,
  productMap: Map<string, number>
) {
  const skus = [...new Set(transactions.flatMap((t) => t.items.map((i) => i.sku)))];

  for (const sku of skus) {
    if (!productMap.has(sku)) {
      throw new Error(`Produk dengan SKU ${sku} belum ada, jalankan seedProducts dulu`);
    }
  }

  const records = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: { sku: true, price: true },
  });

  const priceBySku = new Map(records.map((r) => [r.sku, Number(r.price)]));

  let created = 0;
  let skipped = 0;

  for (const transaction of transactions) {
    const existing = await prisma.transaction.findUnique({
      where: { invoice: transaction.invoice },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const items = transaction.items.map((item) => {
      const price = priceBySku.get(item.sku) ?? 0;

      return {
        productId: productMap.get(item.sku)!,
        quantity: item.quantity,
        price,
        subtotal: roundRupiah(price * item.quantity),
      };
    });

    const total = roundRupiah(items.reduce((sum, item) => sum + item.subtotal, 0));
    const amountPaid = roundRupiah(Math.ceil(total / 5000) * 5000);

    await prisma.transaction.create({
      data: {
        invoice: transaction.invoice,
        userId,
        total,
        items: {
          create: items,
        },
        payment: {
          create: {
            method: transaction.method,
            amountPaid,
            change: roundRupiah(amountPaid - total),
          },
        },
      },
    });

    created += 1;
  }

  return { created, skipped };
}
