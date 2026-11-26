// Konstanta, tipe, dan helper untuk fitur stok (aman dipakai di server maupun client).

export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = "habis" | "menipis" | "aman";
export type MovementType = "masuk" | "keluar" | "opname" | "penjualan";

export type StockProduct = {
  id: number;
  name: string;
  sku: string;
  price: number | string;
  stock: number;
  isActive?: boolean;
  category: { name: string };
};

export type StockMovementRow = {
  id: number;
  type: MovementType;
  reason: string | null;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reference: string | null;
  supplier: string | null;
  note: string | null;
  movedAt: string;
  product: { id: number; name: string; sku: string };
  user: { name: string; username: string };
};

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "habis";
  if (stock <= LOW_STOCK_THRESHOLD) return "menipis";
  return "aman";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  habis: "Habis",
  menipis: "Menipis",
  aman: "Aman",
};

export const MOVEMENT_TYPES: MovementType[] = ["masuk", "keluar", "opname", "penjualan"];

export const TYPE_LABEL: Record<MovementType, string> = {
  masuk: "Stok masuk",
  keluar: "Stok keluar",
  opname: "Opname",
  penjualan: "Penjualan",
};

export const OUT_REASONS = [
  { value: "rusak", label: "Rusak" },
  { value: "kedaluwarsa", label: "Kedaluwarsa" },
  { value: "hilang", label: "Hilang" },
  { value: "retur_supplier", label: "Retur ke supplier" },
  { value: "pemakaian_toko", label: "Pemakaian toko" },
];

export const REASON_LABEL: Record<string, string> = {
  pembelian: "Pembelian dari supplier",
  ...Object.fromEntries(OUT_REASONS.map((r) => [r.value, r.label])),
  selisih_opname: "Selisih opname",
  penjualan: "Penjualan kasir",
};

export function reasonLabel(reason: string | null) {
  if (!reason) return "-";
  return REASON_LABEL[reason] ?? reason;
}

// Jumlah di database selalu positif untuk masuk/keluar/penjualan;
// khusus opname jumlahnya sudah bertanda (selisih).
export function signedQuantity(type: MovementType, quantity: number) {
  return type === "keluar" || type === "penjualan" ? -quantity : quantity;
}

export function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

// "YYYY-MM-DD" -> Date. Hari ini memakai jam sekarang; hari lain jam 12:00 WIB.
// Mengembalikan null jika format salah atau tanggal di masa depan.
export function resolveMovedAt(date?: unknown): Date | null {
  if (date === undefined || date === null || date === "") return new Date();
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (date === todayJakarta()) return new Date();
  const parsed = new Date(`${date}T12:00:00+07:00`);
  if (Number.isNaN(parsed.getTime()) || parsed.getTime() > Date.now()) return null;
  return parsed;
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRp(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}
