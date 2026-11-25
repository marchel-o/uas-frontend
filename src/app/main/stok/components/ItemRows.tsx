'use client'

import { Plus, Trash2 } from "lucide-react";
import type { StockProduct } from "@/lib/stock";
import { inputClass, labelClass, secondaryButton } from "./ui";

export type ItemRow = { key: number; code: string; quantity: string };

let nextKey = 1;

export function newRow(code = ""): ItemRow {
  return { key: nextKey++, code, quantity: "1" };
}

// Cocokkan kode/barcode (SKU) atau nama barang secara persis.
export function findByCode(products: StockProduct[], code: string) {
  const value = code.trim().toLowerCase();
  if (!value) return undefined;

  return (
    products.find((p) => p.sku.toLowerCase() === value) ??
    products.find((p) => p.name.toLowerCase() === value)
  );
}

// Validasi baris form menjadi daftar item untuk API.
// checkStock=true dipakai di stok keluar agar jumlah tidak melebihi stok.
export function rowsToItems(
  products: StockProduct[],
  rows: ItemRow[],
  checkStock = false
): { items: { productId: number; quantity: number }[]; error?: string } {
  const items: { productId: number; quantity: number }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const product = findByCode(products, row.code);

    if (!product) {
      return { items, error: `Baris ${i + 1}: kode atau nama barang tidak ditemukan` };
    }

    const quantity = Number(row.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { items, error: `Baris ${i + 1}: jumlah harus bilangan bulat lebih dari 0` };
    }

    items.push({ productId: product.id, quantity });
  }

  if (checkStock) {
    const totals = new Map<number, number>();
    for (const item of items) {
      totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity);
    }

    for (const [productId, total] of totals) {
      const product = products.find((p) => p.id === productId);
      if (product && total > product.stock) {
        return {
          items,
          error: `Stok ${product.name} hanya ${product.stock}, tidak cukup untuk ${total}`,
        };
      }
    }
  }

  return { items };
}

type Props = {
  products: StockProduct[];
  rows: ItemRow[];
  onChange: (rows: ItemRow[]) => void;
  listId: string;
};

export function ItemRows({ products, rows, onChange, listId }: Props) {
  const update = (key: number, patch: Partial<ItemRow>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-3">
      <datalist id={listId}>
        {products.map((p) => (
          <option key={p.id} value={p.sku}>
            {p.name}
          </option>
        ))}
      </datalist>

      {rows.map((row, index) => {
        const product = findByCode(products, row.code);

        return (
          <div key={row.key} className="rounded-lg border border-[var(--border)] p-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 min-w-0">
                <label className={labelClass} htmlFor={`${listId}-code-${row.key}`}>
                  Kode / barcode barang
                </label>
                <input
                  id={`${listId}-code-${row.key}`}
                  list={listId}
                  className={inputClass}
                  value={row.code}
                  onChange={(e) => update(row.key, { code: e.target.value })}
                  placeholder="Ketik atau scan kode"
                  autoComplete="off"
                />
              </div>

              <div className="w-24 shrink-0">
                <label className={labelClass} htmlFor={`${listId}-qty-${row.key}`}>
                  Jumlah
                </label>
                <input
                  id={`${listId}-qty-${row.key}`}
                  type="number"
                  min={1}
                  step={1}
                  className={inputClass}
                  value={row.quantity}
                  onChange={(e) => update(row.key, { quantity: e.target.value })}
                />
              </div>

              <button
                type="button"
                aria-label={`Hapus baris ${index + 1}`}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={rows.length === 1}
                onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              {row.code.trim() === ""
                ? "Pilih barang dengan mengetik kode atau nama."
                : product
                  ? `${product.name} • stok saat ini ${product.stock}`
                  : "Kode atau nama barang tidak ditemukan."}
            </p>
          </div>
        );
      })}

      <button
        type="button"
        className={`${secondaryButton} w-fit`}
        onClick={() => onChange([...rows, newRow()])}
      >
        <Plus size={16} />
        <span>Tambah barang</span>
      </button>
    </div>
  );
}
