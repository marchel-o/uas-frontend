import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const category = await prisma.category.create({
      data: {
        name: body.name,
      },
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
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan kategori" },
      { status: 500 }
    );
  }
}