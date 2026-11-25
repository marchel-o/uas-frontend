'use client'

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { History, PackagePlus, Search } from "lucide-react";
import {
  LOW_STOCK_THRESHOLD,
  STATUS_LABEL,
  getStockStatus,
  type StockStatus,
} from "@/lib/stock";
import { useProducts } from "./useProducts";
import { cardClass, inputClass, tdClass, thClass } from "./ui";

type StatusFilter = "semua" | StockStatus;

const badgeStyle: Record<StockStatus, string> = {
  habis: "bg-red-600 text-white",
  menipis: "bg-red-100 text-red-700",
  aman: "bg-green-100 text-green-700",
};

const filters: { value: StatusFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "aman", label: "Aman" },
  { value: "menipis", label: "Menipis" },
  { value: "habis", label: "Habis" },
];

function SummaryCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-2xl font-bold">{new Intl.NumberFormat("id-ID").format(value)}</p>
    </>
  );

  const base = `${cardClass} text-left`;

  if (!onClick) return <div className={base}>{content}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${base} cursor-pointer border-2 ${active ? "border-[var(--primary)]" : "border-transparent"}`}
    >
      {content}
    </button>
  );
}

// lowOnly=true dipakai halaman "Barang hampir habis": hanya stok menipis/habis, urut paling sedikit.
export default function StockList({ lowOnly = false }: { lowOnly?: boolean }) {
  const params = useSearchParams();
  const initialStatus = params.get("status");

  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(
    initialStatus === "aman" || initialStatus === "menipis" || initialStatus === "habis"
      ? initialStatus
      : "semua"
  );

  const summary = useMemo(() => {
    let units = 0;
    let low = 0;
    let empty = 0;

    for (const p of products) {
      units += p.stock;
      const s = getStockStatus(p.stock);
      if (s === "menipis") low += 1;
      if (s === "habis") empty += 1;
    }

    return { total: products.length, units, low, empty };
  }, [products]);

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products
      .filter((p) => {
        const s = getStockStatus(p.stock);

        if (lowOnly && s === "aman") return false;
        if (!lowOnly && status !== "semua" && s !== status) return false;

        return (
          !keyword ||
          p.name.toLowerCase().includes(keyword) ||
          p.sku.toLowerCase().includes(keyword) ||
          p.category.name.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => (lowOnly ? a.stock - b.stock : a.name.localeCompare(b.name)));
  }, [products, search, status, lowOnly]);

  const toggle = (value: StockStatus) => setStatus((s) => (s === value ? "semua" : value));

  return (
    <>
      <div>
        <h1 className="font-bold text-2xl">{lowOnly ? "Barang Hampir Habis" : "Daftar Stok"}</h1>
        {lowOnly && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Barang dengan stok {LOW_STOCK_THRESHOLD} atau kurang, diurutkan dari yang paling sedikit.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {lowOnly ? (
          <>
            <SummaryCard label="Stok menipis" value={summary.low} />
            <SummaryCard label="Stok habis" value={summary.empty} />
          </>
        ) : (
          <>
            <SummaryCard label="Total produk" value={summary.total} />
            <SummaryCard label="Total unit stok" value={summary.units} />
            <SummaryCard
              label="Stok menipis"
              value={summary.low}
              active={status === "menipis"}
              onClick={() => toggle("menipis")}
            />
            <SummaryCard
              label="Stok habis"
              value={summary.empty}
              active={status === "habis"}
              onClick={() => toggle("habis")}
            />
          </>
        )}
      </div>

      <div className={cardClass}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              type="search"
              aria-label="Cari barang"
              className={`${inputClass} pl-9`}
              placeholder="Cari nama, kode, atau kategori"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!lowOnly && (
            <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter status">
              {filters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatus(f.value)}
                  aria-pressed={status === f.value}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-all ${
                    status === f.value
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] bg-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-6 text-sm text-[var(--text-secondary)]">Memuat data stok...</p>
          ) : error ? (
            <p className="py-6 text-sm text-red-600">{error}</p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-sm text-[var(--text-secondary)]">
              {lowOnly && products.length > 0 && search.trim() === ""
                ? "Semua stok aman. Tidak ada barang yang hampir habis."
                : "Tidak ada barang yang cocok dengan pencarian."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className={thClass}>Barang</th>
                  <th className={thClass}>Kategori</th>
                  <th className={`${thClass} text-right`}>Stok</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const s = getStockStatus(p.stock);

                  return (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                      <td className={tdClass}>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{p.sku}</p>
                      </td>
                      <td className={tdClass}>{p.category.name}</td>
                      <td
                        className={`${tdClass} text-right font-semibold ${s === "aman" ? "" : "text-red-700"}`}
                      >
                        {p.stock}
                      </td>
                      <td className={tdClass}>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyle[s]}`}>
                          {STATUS_LABEL[s]}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <div className="flex gap-3 whitespace-nowrap">
                          <Link
                            href={`/main/stok/masuk?sku=${encodeURIComponent(p.sku)}`}
                            className="flex items-center gap-1 text-[var(--primary)] hover:underline"
                          >
                            <PackagePlus size={14} />
                            Restock
                          </Link>
                          <Link
                            href={`/main/stok/riwayat?productId=${p.id}`}
                            className="flex items-center gap-1 text-[var(--info)] hover:underline"
                          >
                            <History size={14} />
                            Riwayat
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
