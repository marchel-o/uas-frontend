import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  MAX_PRICE,
  MAX_STOCK,
  hasMaxTwoDecimals,
  isValidImageUrl,
  toNumber,
} from "@/lib/product-rules";

const PRICE_ERROR =
  "Harga jual harus lebih dari 0, maksimal 2 desimal, dan tidak melebihi 9.999.999.999,99";
const BUY_PRICE_ERROR =
  "Harga beli harus 0 atau lebih, maksimal 2 desimal, dan tidak melebihi 9.999.999.999,99";
const STOCK_ERROR = "Stok harus bilangan bulat 0 sampai 2.147.483.647";
const IMAGE_ERROR =
  "URL gambar harus diawali /, http://, atau https:// dan maksimal 500 karakter";

function isValidPrice(value: number, allowZero: boolean) {
  return (
    Number.isFinite(value) &&
    (allowZero ? value >= 0 : value > 0) &&
    value <= MAX_PRICE &&
    hasMaxTwoDecimals(value)
  );
}

function isValidStock(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_STOCK;
}

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

  const price = toNumber(body.price);

  if (!isValidPrice(price, false)) {
    return { error: PRICE_ERROR };
  }

  const buyPrice =
    body.buyPrice == null || body.buyPrice === "" ? null : toNumber(body.buyPrice);

  if (buyPrice !== null && !isValidPrice(buyPrice, true)) {
    return { error: BUY_PRICE_ERROR };
  }

  const stock =
    body.stock == null || body.stock === "" ? 0 : toNumber(body.stock);

  if (!isValidStock(stock)) {
    return { error: STOCK_ERROR };
  }

  const categoryId = toNumber(body.categoryId);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "Kategori wajib dipilih" };
  }

  if (body.image != null && typeof body.image !== "string") {
    return { error: IMAGE_ERROR };
  }

  const image =
    typeof body.image === "string" && body.image.trim() !== ""
      ? body.image.trim()
      : null;

  if (image !== null && !isValidImageUrl(image)) {
    return { error: IMAGE_ERROR };
  }

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
    const price = toNumber(body.price);

    if (!isValidPrice(price, false)) {
      return { error: PRICE_ERROR };
    }

    data.price = price;
  }

  if (body.stock !== undefined) {
    const stock = toNumber(body.stock);

    if (!isValidStock(stock)) {
      return { error: STOCK_ERROR };
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
