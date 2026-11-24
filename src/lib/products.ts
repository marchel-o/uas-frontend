import { Prisma } from "@/generated/prisma/client";

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

  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Harga jual harus lebih dari 0" };
  }

  const buyPrice =
    body.buyPrice == null || body.buyPrice === "" ? null : Number(body.buyPrice);

  if (buyPrice !== null && (!Number.isFinite(buyPrice) || buyPrice < 0)) {
    return { error: "Harga beli tidak valid" };
  }

  const stock = body.stock == null || body.stock === "" ? 0 : Number(body.stock);

  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "Stok harus bilangan bulat 0 atau lebih" };
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

    if (!Number.isFinite(price) || price <= 0) {
      return { error: "Harga jual harus lebih dari 0" };
    }

    data.price = price;
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return { error: "Stok harus bilangan bulat 0 atau lebih" };
    }

    data.stock = stock;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return { error: "Status produk tidak valid" };
    }

    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    return { error: "Tidak ada data yang diubah" };
  }

  return { data };
}
