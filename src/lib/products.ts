import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const MAX_PRICE = 9999999999.99;
export const MAX_STOCK = 2147483647;

export type ProductInput = {
  name: string;
  sku: string;
  buyPrice: number | null;
  price: number;
  stock: number;
  image: string | null;
  categoryId: number;
};

export type ProductPatch = {
  price?: number;
  stock?: number;
  isActive?: boolean;
};

export const productSelect = {
  id: true,
  name: true,
  sku: true,
  buyPrice: true,
  price: true,
  stock: true,
  image: true,
  isActive: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export const categorySelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      products: true,
    },
  },
} satisfies Prisma.CategorySelect;

export function prismaErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }

  return "";
}

export async function skuConflictMessage(sku: string) {
  const existing = await prisma.product.findUnique({
    where: { sku },
    select: { isActive: true },
  });

  if (existing && !existing.isActive) {
    return "SKU sudah terdaftar pada produk nonaktif, silakan aktifkan kembali";
  }

  return "SKU sudah dipakai produk lain";
}

export function parseId(value: string): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProductInput(
  body: unknown
): { data: ProductInput } | { error: string } {
  if (!isPlainObject(body)) {
    return { error: "Data produk tidak valid" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return { error: "Nama produk harus 2-100 karakter" };
  }

  const sku = typeof body.sku === "string" ? body.sku.trim() : "";

  if (sku.length < 2 || sku.length > 50) {
    return { error: "SKU harus 2-50 karakter" };
  }

  const price = Number(body.price);

  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
    return { error: "Harga jual harus lebih dari 0 dan tidak melebihi 9.999.999.999,99" };
  }

  const buyPrice =
    body.buyPrice == null || body.buyPrice === "" ? null : Number(body.buyPrice);

  if (
    buyPrice !== null &&
    (!Number.isFinite(buyPrice) || buyPrice < 0 || buyPrice > MAX_PRICE)
  ) {
    return { error: "Harga beli tidak valid atau melebihi 9.999.999.999,99" };
  }

  const stock = body.stock == null || body.stock === "" ? 0 : Number(body.stock);

  if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
    return { error: "Stok harus bilangan bulat 0 sampai 2.147.483.647" };
  }

  const categoryId = Number(body.categoryId);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "Kategori wajib dipilih" };
  }

  const image =
    typeof body.image === "string" && body.image.trim() !== ""
      ? body.image.trim()
      : null;

  return {
    data: {
      name,
      sku,
      buyPrice,
      price,
      stock,
      image,
      categoryId,
    },
  };
}

export function parseProductPatch(
  body: unknown
): { data: ProductPatch } | { error: string } {
  if (!isPlainObject(body)) {
    return { error: "Data produk tidak valid" };
  }

  const data: ProductPatch = {};

  if (body.price !== undefined) {
    const price = Number(body.price);

    if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
      return { error: "Harga jual harus lebih dari 0 dan tidak melebihi 9.999.999.999,99" };
    }

    data.price = price;
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);

    if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
      return { error: "Stok harus bilangan bulat 0 sampai 2.147.483.647" };
    }

    data.stock = stock;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return { error: "Status produk tidak valid" };
    }

    if (!body.isActive) {
      return { error: "Untuk mengarsipkan produk gunakan hapus produk" };
    }

    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    return { error: "Tidak ada data yang diubah" };
  }

  return { data };
}
