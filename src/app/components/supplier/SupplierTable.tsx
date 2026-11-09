"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Truck } from "lucide-react";

export type Supplier = {
  id: number;
  nama: string;
  kontak?: string;
  telepon: string;
  email?: string;
  alamat?: string;
};

const columns = [
  { key: "nama", label: "Nama supplier" },
  { key: "kontak", label: "Kontak" },
  { key: "telepon", label: "Telepon" },
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
      <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <Truck className="mb-4 h-10 w-10 text-slate-400" aria-hidden />
        <h2 className="text-lg font-semibold text-slate-900">Belum ada supplier</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-600">
          Tambahkan supplier pertama untuk mulai mencatat pembelian barang.
        </p>
        <Link
          href="/supplier/tambah"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Tambah supplier
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, kontak, atau telepon"
          aria-label="Cari supplier"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 font-medium">{c.label}</th>
              ))}
              <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-600">
                  Tidak ada supplier yang cocok dengan &ldquo;{query}&rdquo;.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.key === "nama" ? "font-medium text-slate-900" : "text-slate-700"}`}>
                      {s[c.key] || "-"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/supplier/${s.id}`} className="font-medium text-emerald-700 hover:underline">
                      Lihat detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        Menampilkan {filtered.length} dari {data.length} supplier
      </p>
    </div>
  );
}