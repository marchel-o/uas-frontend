import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, items, method, amountPaid } = body;

    if (
      !userId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !method ||
      amountPaid == null
    ) {
      return NextResponse.json(
        { success: false, message: "Data transaksi tidak lengkap" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: Number(userId) },
      });

      if (!user) {
        throw new Error("Kasir tidak ditemukan");
      }

      const productIds = [...new Set(items.map((item: any) => Number(item.productId)))];

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("Produk tidak ditemukan");
      }

      const transactionItems = items.map((item: any) => {
        const product = products.find(
          (p) => p.id === Number(item.productId)
        );

        const quantity = Number(item.quantity);

        if (!product || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Data produk atau jumlah tidak valid");
        }

        if (!product.isActive) {
          throw new Error(`Produk "${product.name}" sudah tidak aktif`);
        }

        if (product.stock < quantity) {
          throw new Error(`Stok ${product.name} tidak mencukupi`);
        }

        const price = Number(product.price);

        return {
          productId: product.id,
          quantity,
          price,
          subtotal: price * quantity,
        };
      });

      const total = transactionItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      const paid = Number(amountPaid);

      if (!Number.isFinite(paid) || paid < total) {
        throw new Error("Uang pembayaran tidak mencukupi");
      }

      const invoice = `INV-${Date.now()}`;

      const transaction = await tx.transaction.create({
        data: {
          invoice,
          userId: user.id,
          total,
          items: {
            create: transactionItems,
          },
          payment: {
            create: {
              method,
              amountPaid: paid,
              change: paid - total,
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payment: true,
          user: true,
        },
      });

      for (const item of transactionItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error("Stok produk berubah atau tidak mencukupi");
        }
      }

      return transaction;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi berhasil",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("TRANSACTION ERROR:", error);

    return NextResponse.json(
        {
            success: false,
            message:
                error instanceof Error
                ? error.message
                : "Gagal membuat transaksi",
            stack: error instanceof Error ? error.stack : null,
            },
            { status: 400 }
        );
    }
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil riwayat transaksi",
      },
      { status: 500 }
    );
  }
}