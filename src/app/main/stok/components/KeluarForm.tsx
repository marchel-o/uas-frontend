'use client'

import { useState, type FormEvent } from "react";
import { PackageMinus } from "lucide-react";
import { OUT_REASONS } from "@/lib/stock";
import { useProducts } from "./useProducts";
import { ItemRows, newRow, rowsToItems, type ItemRow } from "./ItemRows";
import { Notice, type NoticeState } from "./Notice";
import { cardClass, inputClass, labelClass, primaryButton } from "./ui";

export default function KeluarForm() {
  const { products, loading, error, reload } = useProducts();

  const [reason, setReason] = useState(OUT_REASONS[0].value);
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<ItemRow[]>(() => [newRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);

    const parsed = rowsToItems(products, rows, true);
    if (parsed.error) {
      setNotice({ type: "error", text: parsed.error });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/stock/out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note, items: parsed.items }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Gagal menyimpan stok keluar");
      }

      setNotice({ type: "success", text: result.message });
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
        <h1 className="font-bold text-2xl">Stok Keluar</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Catat barang yang keluar bukan karena penjualan kasir: rusak, kedaluwarsa, hilang, retur,
          atau dipakai toko.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
        <div className="md:w-1/2">
          <label className={labelClass} htmlFor="reason">
            Alasan
          </label>
          <select
            id="reason"
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {OUT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">Memuat daftar barang...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <ItemRows products={products} rows={rows} onChange={setRows} listId="keluar-items" />
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

        <div>
          <button type="submit" className={primaryButton} disabled={submitting || loading || !!error}>
            <PackageMinus size={16} />
            <span>{submitting ? "Menyimpan..." : "Simpan stok keluar"}</span>
          </button>
        </div>
      </form>
    </>
  );
}
