import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
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
    const body = await request.json();

    const { name, sku, price, stock, categoryId } = body;

    if (!name || !sku || price == null || stock == null || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Semua data produk wajib diisi" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
      },
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
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan produk" },
      { status: 500 }
    );
  }
}