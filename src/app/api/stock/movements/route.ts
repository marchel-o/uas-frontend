import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/stock";
import { errorResponse, requireUser } from "@/lib/stock-api";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Riwayat perubahan stok dengan filter, paginasi, dan mode `all=1` untuk ekspor CSV.
export async function GET(request: NextRequest) {
  try {
    await requireUser();

    const sp = request.nextUrl.searchParams;
    const where: Prisma.StockMovementWhereInput = {};

    const type = sp.get("type");
    if (type && MOVEMENT_TYPES.includes(type as MovementType)) {
      where.type = type as MovementType;
    }

    const reason = sp.get("reason");
    if (reason) where.reason = reason;

    const productId = Number(sp.get("productId"));
    if (Number.isInteger(productId) && productId > 0) {
      where.productId = productId;
    }

    const from = sp.get("from");
    const to = sp.get("to");
    const validFrom = from && DATE_PATTERN.test(from) ? from : null;
    const validTo = to && DATE_PATTERN.test(to) ? to : null;
    if (validFrom || validTo) {
      where.movedAt = {
        ...(validFrom ? { gte: new Date(`${validFrom}T00:00:00+07:00`) } : {}),
        ...(validTo ? { lte: new Date(`${validTo}T23:59:59.999+07:00`) } : {}),
      };
    }

    const q = sp.get("q")?.trim();
    if (q) {
      where.OR = [
        { product: { name: { contains: q, mode: "insensitive" } } },
        { product: { sku: { contains: q, mode: "insensitive" } } },
        { reference: { contains: q, mode: "insensitive" } },
      ];
    }

    const all = sp.get("all") === "1";
    const pageSize = Math.min(Math.max(Number(sp.get("pageSize")) || 20, 1), 100);
    const page = Math.max(Number(sp.get("page")) || 1, 1);

    const [total, data] = await prisma.$transaction([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { name: true, username: true } },
        },
        orderBy: [{ movedAt: "desc" }, { id: "desc" }],
        ...(all ? { take: Number(5000) } : { skip: (page - 1) * pageSize, take: pageSize }),
      }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      total,
      page: all ? 1 : page,
      totalPages: all ? 1 : Math.max(Math.ceil(total / pageSize), 1),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
