import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OUT_REASONS } from "@/lib/stock";
import {
  StockError,
  errorResponse,
  findProducts,
  isNotFoundError,
  parseItems,
  pickProduct,
  readBody,
  requireUser,
} from "@/lib/stock-api";

// Stok keluar: mengurangi stok (rusak, kedaluwarsa, hilang, retur, pemakaian toko).
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await readBody(request);

    const reason = String(body.reason ?? "");
    if (!OUT_REASONS.some((r) => r.value === reason)) {
      throw new StockError("Alasan stok keluar tidak valid");
    }

    const note = String(body.note ?? "").trim() || null;
    const items = parseItems(body.items);

    const count = await prisma.$transaction(
      async (tx) => {
        const products = await findProducts(tx, items);

        for (const item of items) {
          const product = pickProduct(products, item);

          let updated: { stock: number };
          try {
            // where ikut memeriksa stok, jadi tidak mungkin menjadi negatif
            updated = await tx.product.update({
              where: { id: product.id, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
              select: { stock: true },
            });
          } catch (error) {
            if (isNotFoundError(error)) {
              throw new StockError(`Stok ${product.name} tidak mencukupi`);
            }
            throw error;
          }

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: "keluar",
              reason,
              quantity: item.quantity,
              stockBefore: updated.stock + item.quantity,
              stockAfter: updated.stock,
              note,
              userId: user.id,
            },
          });
        }

        return items.length;
      },
      { timeout: 15000, maxWait: 10000 }
    );

    return NextResponse.json(
      {
        success: true,
        message: `${count} barang berhasil dicatat sebagai stok keluar`,
        data: { count },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
