import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySelect, prismaErrorCode } from "@/lib/products";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: categorySelect,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const name =
      typeof body?.name === "string" ? body.name.trim() : "";

    if (name.length < 1 || name.length > 50) {
      return NextResponse.json(
        { success: false, message: "Nama kategori harus 1-50 karakter" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
      select: categorySelect,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil ditambahkan",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      return NextResponse.json(
        { success: false, message: "Kategori sudah ada" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal menambahkan kategori" },
      { status: 500 }
    );
  }
}
