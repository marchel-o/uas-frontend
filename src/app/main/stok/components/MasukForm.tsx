'use client'

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { PackagePlus } from "lucide-react";
import { todayJakarta } from "@/lib/stock";
import { useProducts } from "./useProducts";
import { ItemRows, newRow, rowsToItems, type ItemRow } from "./ItemRows";
import { Notice, type NoticeState } from "./Notice";
import { cardClass, inputClass, labelClass, primaryButton } from "./ui";

export default function MasukForm() {
  const params = useSearchParams();
  const { products, loading, error, reload } = useProducts();

  const [reference, setReference] = useState("");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(todayJakarta);
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<ItemRow[]>(() => [newRow(params.get("sku") ?? "")]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);

    const parsed = rowsToItems(products, rows);
    if (parsed.error) {
      setNotice({ type: "error", text: parsed.error });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/stock/in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, supplier, date, note, items: parsed.items }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Gagal menyimpan stok masuk");
      }

      setNotice({ type: "success", text: result.message });
      setReference("");
      setSupplier("");
      setNote("");
      setRows([newRow()]);
      reload();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div>
        <h1 className="font-bold text-2xl">Stok Masuk</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Catat barang yang diterima dari supplier. Satu faktur bisa berisi beberapa barang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="reference">
              Nomor faktur
            </label>
            <input
              id="reference"
              className={inputClass}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Contoh: FKT-2026-001"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="supplier">
              Supplier
            </label>
            <input
              id="supplier"
              className={inputClass}
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Nama supplier"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="date">
              Tanggal terima
            </label>
            <input
              id="date"
              type="date"
              className={inputClass}
              value={date}
              max={todayJakarta()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">Memuat daftar barang...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <ItemRows products={products} rows={rows} onChange={setRows} listId="masuk-items" />
        )}

        <div>
          <label className={labelClass} htmlFor="note">
            Catatan (opsional)
          </label>
          <textarea
            id="note"
            rows={2}
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Notice notice={notice} />

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={primaryButton} disabled={submitting || loading || !!error}>
            <PackagePlus size={16} />
            <span>{submitting ? "Menyimpan..." : "Simpan stok masuk"}</span>
          </button>
          <Link href="/main/stok/riwayat?type=masuk" className="text-sm text-[var(--info)] hover:underline">
            Lihat riwayat stok masuk
          </Link>
        </div>
      </form>
    </>
  );
}
