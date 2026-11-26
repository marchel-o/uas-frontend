import "server-only";

import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";

export class StockError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new StockError("Silakan login terlebih dahulu", 401);
  }

  return user;
}

export async function readBody(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    throw new StockError("Data yang dikirim tidak valid");
  }

  return body as Record<string, unknown>;
}

export function errorResponse(error: unknown) {
  if (error instanceof StockError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }

  console.error("STOCK ERROR:", error);

  return NextResponse.json(
    { success: false, message: "Terjadi kesalahan pada server" },
    { status: 500 }
  );
}

export type ItemInput = {
  productId?: number;
  sku?: string;
  quantity: number;
};

export function parseItems(raw: unknown): ItemInput[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new StockError("Minimal satu barang harus diisi");
  }

  if (raw.length > 100) {
    throw new StockError("Maksimal 100 barang per pengiriman");
  }

  return raw.map((entry, index) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const row = index + 1;

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new StockError(`Jumlah pada baris ${row} harus bilangan bulat lebih dari 0`);
    }

    const productId =
      item.productId === undefined || item.productId === null
        ? undefined
        : Number(item.productId);
    const sku = typeof item.sku === "string" ? item.sku.trim() : undefined;

    const hasId = productId !== undefined && Number.isInteger(productId);
    if (!hasId && !sku) {
      throw new StockError(`Barang pada baris ${row} belum dipilih`);
    }

    return { productId: hasId ? productId : undefined, sku: sku || undefined, quantity };
  });
}

export async function findProducts(tx: Prisma.TransactionClient, items: ItemInput[]) {
  const ids = items.flatMap((i) => (i.productId !== undefined ? [i.productId] : []));
  const skus = items.flatMap((i) => (i.sku ? [i.sku] : []));

  return tx.product.findMany({
    where: { OR: [{ id: { in: ids } }, { sku: { in: skus } }] },
  });
}

export function pickProduct<T extends { id: number; sku: string; name: string }>(
  products: T[],
  item: ItemInput
): T {
  const product = products.find(
    (p) =>
      (item.productId !== undefined && p.id === item.productId) ||
      (item.sku !== undefined && p.sku === item.sku)
  );

  if (!product) {
    throw new StockError(`Barang tidak ditemukan (${item.sku ?? item.productId})`);
  }

  return product;
}

export function isNotFoundError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
