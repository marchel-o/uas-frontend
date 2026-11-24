import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseId,
  parseProductInput,
  parseProductPatch,
  prismaErrorCode,
  productSelect,
} from "@/lib/products";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const invalidId = () =>
  NextResponse.json(
    { success: false, message: "ID produk tidak valid" },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json(
    { success: false, message: "Produk tidak ditemukan" },
    { status: 404 }
  );

function handleWriteError(error: unknown, fallback: string) {
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

  if (code === "P2025") {
    return notFound();
  }

  return NextResponse.json(
    { success: false, message: fallback },
    { status: 500 }
  );
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const id = parseId((await params).id);

  if (!id) return invalidId();

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });

    if (!product) return notFound();

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const id = parseId((await params).id);

  if (!id) return invalidId();

  try {
    const body = await request.json().catch(() => null);
    const parsed = parseProductInput(body);

    if ("error" in parsed) {
      return NextResponse.json(
        { success: false, message: parsed.error },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      select: productSelect,
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diubah",
      data: product,
    });
  } catch (error) {
    return handleWriteError(error, "Gagal mengubah produk");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = parseId((await params).id);

  if (!id) return invalidId();

  try {
    const body = await request.json().catch(() => null);
    const parsed = parseProductPatch(body);

    if ("error" in parsed) {
      return NextResponse.json(
        { success: false, message: parsed.error },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      select: productSelect,
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: product,
    });
  } catch (error) {
    return handleWriteError(error, "Gagal memperbarui produk");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const id = parseId((await params).id);

  if (!id) return invalidId();

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false, stock: 0 },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
      data: product,
    });
  } catch (error) {
    return handleWriteError(error, "Gagal menghapus produk");
  }
}
