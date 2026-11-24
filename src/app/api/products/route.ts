import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseProductInput,
  prismaErrorCode,
  productSelect,
} from "@/lib/products";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const q = params.get("q")?.trim();
    const categoryIdParam = params.get("categoryId");
    const pageParam = params.get("page");
    const limitParam = params.get("limit");

    const where: Prisma.ProductWhereInput = {};

    if (params.get("includeInactive") !== "1") {
      where.isActive = true;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ];
    }

    if (categoryIdParam) {
      const categoryId = Number(categoryIdParam);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          { success: false, message: "ID kategori tidak valid" },
          { status: 400 }
        );
      }

      where.categoryId = categoryId;
    }

    if (pageParam !== null && limitParam !== null) {
      const page = Number(pageParam);
      const limit = Number(limitParam);

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        return NextResponse.json(
          { success: false, message: "Parameter page atau limit tidak valid" },
          { status: 400 }
        );
      }

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          select: productSelect,
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: products,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    const products = await prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = parseProductInput(body);

    if ("error" in parsed) {
      return NextResponse.json(
        { success: false, message: parsed.error },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: parsed.data,
      select: productSelect,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2002") {
      return NextResponse.json(
        { success: false, message: "SKU sudah dipakai produk lain" },
        { status: 409 }
      );
    }

    if (code === "P2003") {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal menambahkan produk" },
      { status: 500 }
    );
  }
}
