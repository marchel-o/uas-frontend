import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMovedAt } from "@/lib/stock";
import {
  StockError,
  errorResponse,
  findProducts,
  parseItems,
  pickProduct,
  readBody,
  requireUser,
} from "@/lib/stock-api";

// Stok masuk: menambah stok dan mencatat satu baris riwayat per barang.
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await readBody(request);

    const reference = String(body.reference ?? "").trim();
    if (!reference) throw new StockError("Nomor faktur wajib diisi");

    const supplier = String(body.supplier ?? "").trim() || null;
    const note = String(body.note ?? "").trim() || null;

    const movedAt = resolveMovedAt(body.date);
    if (!movedAt) throw new StockError("Tanggal tidak valid atau berada di masa depan");

    const items = parseItems(body.items);

    const count = await prisma.$transaction(
      async (tx) => {
        const products = await findProducts(tx, items);

        for (const item of items) {
          const product = pickProduct(products, item);

          const updated = await tx.product.update({
            where: { id: product.id },
            data: { stock: { increment: item.quantity } },
            select: { stock: true },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: "masuk",
              reason: "pembelian",
              quantity: item.quantity,
              stockBefore: updated.stock - item.quantity,
              stockAfter: updated.stock,
              reference,
              supplier,
              note,
              movedAt,
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
        message: `${count} barang berhasil dicatat sebagai stok masuk`,
        data: { count },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
