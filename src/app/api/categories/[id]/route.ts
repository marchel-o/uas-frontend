import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySelect, parseId, prismaErrorCode } from "@/lib/products";
import { unauthorizedResponse } from "@/lib/api-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const CATEGORY_IN_USE =
  "Kategori tidak bisa dihapus karena masih terhubung dengan data/riwayat produk";

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const denied = await unauthorizedResponse();

  if (denied) return denied;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID kategori tidak valid" },
      { status: 400 }
    );
  }

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

    const category = await prisma.category.update({
      where: { id },
      data: { name },
      select: categorySelect,
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diubah",
      data: category,
    });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Kategori sudah ada" },
        { status: 409 }
      );
    }

    if (code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal mengubah kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const denied = await unauthorizedResponse();

  if (denied) return denied;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID kategori tidak valid" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { success: false, message: CATEGORY_IN_USE },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
      data: { id },
    });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2003") {
      return NextResponse.json(
        { success: false, message: CATEGORY_IN_USE },
        { status: 409 }
      );
    }

    if (code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
