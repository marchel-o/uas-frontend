'use client'

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, X } from "lucide-react";
import {
  MOVEMENT_TYPES,
  REASON_LABEL,
  TYPE_LABEL,
  formatDateTime,
  reasonLabel,
  signedQuantity,
  todayJakarta,
  type MovementType,
  type StockMovementRow,
} from "@/lib/stock";
import { cardClass, inputClass, labelClass, secondaryButton, tdClass, thClass } from "./ui";

const PAGE_SIZE = 20;

const typeBadge: Record<MovementType, string> = {
  masuk: "bg-green-100 text-green-700",
  keluar: "bg-red-100 text-red-700",
  opname: "bg-amber-100 text-amber-800",
  penjualan: "bg-sky-100 text-sky-800",
};

// Sel CSV: tanda kutip digandakan; teks yang diawali = + - @ diberi ' agar tidak dibaca sebagai rumus.
function csvText(value: string | null | undefined) {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function MovementHistory() {
  const params = useSearchParams();
  const initialType = params.get("type");

  const [type, setType] = useState(
    MOVEMENT_TYPES.includes(initialType as MovementType) ? (initialType as string) : ""
  );
  const [reason, setReason] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [productId, setProductId] = useState(params.get("productId") ?? "");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<StockMovementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(qInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [qInput]);

  const filterQuery = useMemo(() => {
    const sp = new URLSearchParams();
    if (type) sp.set("type", type);
    if (reason) sp.set("reason", reason);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (q) sp.set("q", q);
    if (productId) sp.set("productId", productId);
    return sp.toString();
  }, [type, reason, from, to, q, productId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const sp = new URLSearchParams(filterQuery);
        sp.set("page", String(page));
        sp.set("pageSize", String(PAGE_SIZE));

        const response = await fetch(`/api/stock/movements?${sp}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message ?? "Gagal mengambil riwayat stok");
        }

        if (!cancelled) {
          setData(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filterQuery, page]);

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  async function exportCsv() {
    setExporting(true);

    try {
      const sp = new URLSearchParams(filterQuery);
      sp.set("all", "1");

      const response = await fetch(`/api/stock/movements?${sp}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Gagal mengunduh data");
      }

      const rows: StockMovementRow[] = result.data;
      const header = [
        "Waktu",
        "Barang",
        "Kode",
        "Jenis",
        "Alasan",
        "Jumlah",
        "Stok sebelum",
        "Stok akhir",
        "Petugas",
        "Faktur",
        "Supplier",
        "Catatan",
      ];

      const lines = rows.map((r) =>
        [
          csvText(formatDateTime(r.movedAt)),
          csvText(r.product.name),
          csvText(r.product.sku),
          csvText(TYPE_LABEL[r.type]),
          csvText(reasonLabel(r.reason)),
          signedQuantity(r.type, r.quantity),
          r.stockBefore,
          r.stockAfter,
          csvText(r.user.name),
          csvText(r.reference),
          csvText(r.supplier),
          csvText(r.note),
        ].join(",")
      );

      const blob = new Blob(["\uFEFF" + [header.map(csvText).join(","), ...lines].join("\r\n")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `riwayat-stok-${todayJakarta()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunduh data");
    } finally {
      setExporting(false);
    }
  }

  const productName = data.find((r) => String(r.product.id) === productId)?.product.name;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl">Riwayat Perubahan Stok</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Semua stok masuk, keluar, opname, dan penjualan yang tercatat.
          </p>
        </div>

        <button
          type="button"
          className={`${secondaryButton} shrink-0`}
          onClick={exportCsv}
          disabled={exporting || total === 0}
        >
          <Download size={16} />
          <span>{exporting ? "Menyiapkan..." : "Unduh CSV"}</span>
        </button>
      </div>

      <div className={`${cardClass} flex flex-col gap-3`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className={labelClass} htmlFor="q">
              Cari
            </label>
            <input
              id="q"
              type="search"
              className={inputClass}
              placeholder="Nama, kode, atau nomor faktur"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="type">
              Jenis
            </label>
            <select
              id="type"
              className={inputClass}
              value={type}
              onChange={(e) => changeFilter(setType)(e.target.value)}
            >
              <option value="">Semua jenis</option>
              {MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="reason">
              Alasan
            </label>
            <select
              id="reason"
              className={inputClass}
              value={reason}
              onChange={(e) => changeFilter(setReason)(e.target.value)}
            >
              <option value="">Semua alasan</option>
              {Object.entries(REASON_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:grid-cols-1">
            <div>
              <label className={labelClass} htmlFor="from">
                Dari tanggal
              </label>
              <input
                id="from"
                type="date"
                className={inputClass}
                value={from}
                max={to || undefined}
                onChange={(e) => changeFilter(setFrom)(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="to">
                Sampai tanggal
              </label>
              <input
                id="to"
                type="date"
                className={inputClass}
                value={to}
                min={from || undefined}
                onChange={(e) => changeFilter(setTo)(e.target.value)}
              />
            </div>
          </div>
        </div>

        {productId && (
          <div className="flex">
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm text-[var(--primary)]">
              Barang: {productName ?? `#${productId}`}
              <button
                type="button"
                aria-label="Hapus filter barang"
                className="cursor-pointer"
                onClick={() => changeFilter(setProductId)("")}
              >
                <X size={14} />
              </button>
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          {error ? (
            <p className="py-6 text-sm text-red-600">{error}</p>
          ) : loading && data.length === 0 ? (
            <p className="py-6 text-sm text-[var(--text-secondary)]">Memuat riwayat stok...</p>
          ) : data.length === 0 ? (
            <p className="py-6 text-sm text-[var(--text-secondary)]">
              Belum ada riwayat yang cocok dengan filter ini.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className={thClass}>Waktu</th>
                  <th className={thClass}>Barang</th>
                  <th className={thClass}>Jenis</th>
                  <th className={thClass}>Alasan</th>
                  <th className={`${thClass} text-right`}>Jumlah</th>
                  <th className={`${thClass} text-right`}>Stok akhir</th>
                  <th className={thClass}>Petugas</th>
                  <th className={thClass}>Keterangan</th>
                </tr>
              </thead>
              <tbody className={loading ? "opacity-60" : ""}>
                {data.map((r) => {
                  const qty = signedQuantity(r.type, r.quantity);
                  const detail = [r.reference, r.supplier, r.note].filter(Boolean).join(" • ");

                  return (
                    <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(r.movedAt)}</td>
                      <td className={tdClass}>
                        <p className="font-semibold">{r.product.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{r.product.sku}</p>
                      </td>
                      <td className={tdClass}>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge[r.type]}`}>
                          {TYPE_LABEL[r.type]}
                        </span>
                      </td>
                      <td className={tdClass}>{reasonLabel(r.reason)}</td>
                      <td
                        className={`${tdClass} text-right font-semibold ${qty > 0 ? "text-green-700" : "text-red-600"}`}
                      >
                        {qty > 0 ? `+${qty}` : qty}
                      </td>
                      <td className={`${tdClass} text-right`}>{r.stockAfter}</td>
                      <td className={tdClass}>{r.user.name}</td>
                      <td className={`${tdClass} text-[var(--text-secondary)]`}>{detail || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {total > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">
              Halaman {page} dari {totalPages} ({total} catatan)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className={secondaryButton}
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className={secondaryButton}
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
