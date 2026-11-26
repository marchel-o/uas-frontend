import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  StockError,
  errorResponse,
  isNotFoundError,
  readBody,
  requireUser,
} from "@/lib/stock-api";

type OpnameItem = {
  productId: number;
  systemStock: number;
  physicalStock: number;
};

function parseOpnameItems(raw: unknown): OpnameItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new StockError("Belum ada barang yang dihitung");
  }

  if (raw.length > 500) {
    throw new StockError("Maksimal 500 barang per opname");
  }

  return raw.map((entry, index) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const productId = Number(item.productId);
    const systemStock = Number(item.systemStock);
    const physicalStock = Number(item.physicalStock);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(systemStock) ||
      !Number.isInteger(physicalStock) ||
      physicalStock < 0
    ) {
      throw new StockError(`Data opname baris ${index + 1} tidak valid`);
    }

    return { productId, systemStock, physicalStock };
  });
}

// Stok opname: menyamakan stok sistem dengan hasil hitung fisik.
// Hanya barang yang selisihnya tidak nol yang diubah dan dicatat.
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await readBody(request);

    const note = String(body.note ?? "").trim() || null;
    const items = parseOpnameItems(body.items);

    const result = await prisma.$transaction(
      async (tx) => {
        let applied = 0;

        for (const item of items) {
          const diff = item.physicalStock - item.systemStock;
          if (diff === 0) continue;

          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
          });

          if (!product) throw new StockError("Barang tidak ditemukan");

          try {
            // Hanya berhasil jika stok masih sama dengan yang dilihat petugas
            await tx.product.update({
              where: { id: item.productId, stock: item.systemStock },
              data: { stock: item.physicalStock },
            });
          } catch (error) {
            if (isNotFoundError(error)) {
              throw new StockError(
                `Stok ${product.name} sudah berubah sejak dimuat. Muat ulang halaman lalu hitung ulang.`
              );
            }
            throw error;
          }

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: "opname",
              reason: "selisih_opname",
              quantity: diff,
              stockBefore: item.systemStock,
              stockAfter: item.physicalStock,
              note,
              userId: user.id,
            },
          });

          applied += 1;
        }

        return { applied, unchanged: items.length - applied };
      },
      { timeout: 30000, maxWait: 10000 }
    );

    return NextResponse.json({
      success: true,
      message:
        result.applied === 0
          ? "Tidak ada selisih, stok sistem sudah sesuai"
          : `Opname diterapkan: ${result.applied} barang disesuaikan`,
      data: result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
