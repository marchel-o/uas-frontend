'use client'

import { useMemo, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import type { StockProduct } from "@/lib/stock";
import { useProducts } from "./useProducts";
import { Notice, type NoticeState } from "./Notice";
import { cardClass, inputClass, labelClass, primaryButton, secondaryButton, tdClass, thClass } from "./ui";

type Entry =
  | { product: StockProduct; state: "kosong" }
  | { product: StockProduct; state: "tidak-valid" }
  | { product: StockProduct; state: "ok"; physical: number; diff: number };

export default function OpnameTable() {
  const { products, loading, error, reload } = useProducts();

  const [counts, setCounts] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  const entries = useMemo<Entry[]>(
    () =>
      products.map((product) => {
        const raw = counts[product.id];
        if (raw === undefined || raw.trim() === "") return { product, state: "kosong" };

        const physical = Number(raw);
        if (!Number.isInteger(physical) || physical < 0) return { product, state: "tidak-valid" };

        return { product, state: "ok", physical, diff: physical - product.stock };
      }),
    [products, counts]
  );

  const counted = entries.filter((e) => e.state === "ok").length;
  const invalid = entries.filter((e) => e.state === "tidak-valid").length;
  const changes = entries.filter(
    (e): e is Extract<Entry, { state: "ok" }> => e.state === "ok" && e.diff !== 0
  );

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return entries.filter(
      (e) =>
        !keyword ||
        e.product.name.toLowerCase().includes(keyword) ||
        e.product.sku.toLowerCase().includes(keyword)
    );
  }, [entries, search]);

  async function apply() {
    setSubmitting(true);
    setNotice(null);

    try {
      const response = await fetch("/api/stock/opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          items: changes.map((c) => ({
            productId: c.product.id,
            systemStock: c.product.stock,
            physicalStock: c.physical,
          })),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Gagal menerapkan opname");
      }

      setNotice({ type: "success", text: result.message });
      setCounts({});
      setNote("");
      reload();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div>
        <h1 className="font-bold text-2xl">Stok Opname</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Isi stok hasil hitung fisik. Selisih dihitung otomatis, dan stok sistem baru berubah setelah
          Anda menekan Terapkan. Barang yang dikosongkan dianggap belum dihitung.
        </p>
      </div>

      <div className={cardClass}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="search"
            aria-label="Cari barang"
            className={`${inputClass} pl-9`}
            placeholder="Cari nama atau kode barang"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-6 text-sm text-[var(--text-secondary)]">Memuat data stok...</p>
          ) : error ? (
            <p className="py-6 text-sm text-red-600">{error}</p>
          ) : visible.length === 0 ? (
            <p className="py-6 text-sm text-[var(--text-secondary)]">
              Tidak ada barang yang cocok dengan pencarian.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className={thClass}>Barang</th>
                  <th className={`${thClass} text-right`}>Stok sistem</th>
                  <th className={thClass}>Stok fisik</th>
                  <th className={`${thClass} text-right`}>Selisih</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => (
                  <tr key={entry.product.id} className="border-b border-[var(--border)] last:border-0">
                    <td className={tdClass}>
                      <p className="font-semibold">{entry.product.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{entry.product.sku}</p>
                    </td>
                    <td className={`${tdClass} text-right`}>{entry.product.stock}</td>
                    <td className={tdClass}>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        aria-label={`Stok fisik ${entry.product.name}`}
                        className={`${inputClass} w-24`}
                        value={counts[entry.product.id] ?? ""}
                        onChange={(e) =>
                          setCounts((c) => ({ ...c, [entry.product.id]: e.target.value }))
                        }
                      />
                    </td>
                    <td className={`${tdClass} text-right font-semibold`}>
                      {entry.state === "kosong" ? (
                        <span className="text-[var(--text-secondary)]">-</span>
                      ) : entry.state === "tidak-valid" ? (
                        <span className="text-red-600 font-normal">Tidak valid</span>
                      ) : entry.diff === 0 ? (
                        <span className="text-green-700 font-normal">Sesuai</span>
                      ) : entry.diff > 0 ? (
                        <span className="text-green-700">+{entry.diff}</span>
                      ) : (
                        <span className="text-red-600">{entry.diff}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={`${cardClass} flex flex-col gap-3`}>
        <p className="text-sm">
          <strong>{counted}</strong> barang dihitung, <strong>{changes.length}</strong> berselisih
          {invalid > 0 && (
            <span className="text-red-600"> • {invalid} isian tidak valid</span>
          )}
        </p>

        <div>
          <label className={labelClass} htmlFor="note">
            Catatan opname (opsional)
          </label>
          <textarea
            id="note"
            rows={2}
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Opname bulanan rak A"
          />
        </div>

        <Notice notice={notice} />

        <div>
          <button
            type="button"
            className={primaryButton}
            disabled={changes.length === 0 || invalid > 0 || submitting}
            onClick={() => setConfirmOpen(true)}
          >
            <ClipboardCheck size={16} />
            <span>Terapkan</span>
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opname-confirm-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-[var(--surface)] p-5 shadow-lg">
            <h2 id="opname-confirm-title" className="font-bold text-lg">
              Terapkan hasil opname?
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Stok sistem {changes.length} barang akan diganti dengan stok fisik, dan setiap
              perubahan dicatat di riwayat. Tindakan ini tidak bisa dibatalkan, hanya bisa dikoreksi
              dengan opname atau stok masuk/keluar berikutnya.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className={secondaryButton}
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                Batal
              </button>
              <button type="button" className={primaryButton} disabled={submitting} onClick={apply}>
                {submitting ? "Menerapkan..." : "Ya, terapkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
