import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseId,
  parseProductInput,
  parseProductPatch,
  prismaErrorCode,
  productSelect,
  skuConflictMessage,
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

const inactiveConflict = () =>
  NextResponse.json(
    { success: false, message: "Produk nonaktif, aktifkan kembali sebelum diubah" },
    { status: 409 }
  );

async function resolveMissingProduct(id: number) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  return existing ? inactiveConflict() : notFound();
}

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

  const body = await request.json().catch(() => null);
  const parsed = parseProductInput(body);

  if ("error" in parsed) {
    return NextResponse.json(
      { success: false, message: parsed.error },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id, isActive: true },
      data: parsed.data,
      select: productSelect,
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diubah",
      data: product,
    });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return resolveMissingProduct(id);
    }

    if (code === "P2002") {
      return NextResponse.json(
        { success: false, message: await skuConflictMessage(parsed.data.sku) },
        { status: 409 }
      );
    }

    return handleWriteError(error, "Gagal mengubah produk");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = parseId((await params).id);

  if (!id) return invalidId();

  const body = await request.json().catch(() => null);
  const parsed = parseProductPatch(body);

  if ("error" in parsed) {
    return NextResponse.json(
      { success: false, message: parsed.error },
      { status: 400 }
    );
  }

  const restoring = parsed.data.isActive === true;

  try {
    const product = await prisma.product.update({
      where: restoring ? { id } : { id, isActive: true },
      data: parsed.data,
      select: productSelect,
    });

    return NextResponse.json({
      success: true,
      message: restoring ? "Produk berhasil dipulihkan" : "Produk berhasil diperbarui",
      data: product,
    });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return restoring ? notFound() : resolveMissingProduct(id);
    }

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
