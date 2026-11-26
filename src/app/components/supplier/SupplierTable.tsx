"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Truck } from "lucide-react";

export type Supplier = {
  id: number;
  name: string;
  contactName: string | null;
  phone: string;
  email: string | null;
  address: string | null;
};

const columns = [
  { key: "name", label: "Nama supplier" },
  { key: "contactName", label: "Kontak" },
  { key: "phone", label: "Telepon" },
  { key: "email", label: "Email" },
] as const;

export default function SupplierTable({ data }: { data: Supplier[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = data.filter((s) =>
    columns.some(({ key }) => s[key]?.toLowerCase().includes(q))
  );

  // Belum ada supplier sama sekali
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl bg-[var(--surface)] shadow-lg px-6 py-16 text-center">
        <Truck className="mb-4 h-10 w-10 text-gray-400" aria-hidden />
        <h2 className="text-lg font-semibold">Belum ada supplier</h2>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          Tambahkan supplier pertama untuk mulai mencatat pembelian barang.
        </p>
        <Link
          href="/main/supplier/tambah"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-light)] hover:bg-[var(--primary-hover)] transition-all"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Tambah supplier
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl p-4 bg-[var(--surface)] shadow-lg">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, kontak, atau telepon"
          aria-label="Cari supplier"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="text-left text-[var(--text-secondary)]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-[var(--text-secondary)]"
                >
                  Tidak ada supplier yang cocok dengan &ldquo;{query}&rdquo;.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 ${
                        c.key === "name" ? "font-medium" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {s[c.key] || "-"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/main/supplier/${s.id}`}
                      className="font-medium text-[var(--primary)] hover:underline"
                    >
                      Lihat detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        Menampilkan {filtered.length} dari {data.length} supplier
      </p>
    </div>
  );
}