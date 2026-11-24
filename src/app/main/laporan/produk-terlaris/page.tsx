'use client'

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Category,
  TODAY,
  addDays,
  categoryClass,
  filterRange,
  formatRupiah,
  topProducts,
} from "../data"
import { ReportStatus, useReportData } from "../useReportData"
import { inputClass } from "../ui"

const PERIODS = [
  { key: "today", label: "Hari ini", from: TODAY },
  { key: "7", label: "7 hari terakhir", from: addDays(TODAY, -6) },
  { key: "30", label: "30 hari terakhir", from: addDays(TODAY, -29) },
  { key: "all", label: "Semua waktu", from: "" },
]

export default function ProdukTerlaris() {
  const [category, setCategory] = useState<Category | "">("")
  const [period, setPeriod] = useState("30")
  const { transactions, categories, loading, error } = useReportData()

  if (loading || error) return <ReportStatus loading={loading} error={error} />

  const from = PERIODS.find((p) => p.key === period)?.from ?? ""
  const rows = topProducts(filterRange(transactions, from, TODAY), category)
  const top5 = rows.slice(0, 5)

  return (
    <>
      <div className="no-print rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Kategori</label>
            <select
              className={`${inputClass} cursor-pointer`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Periode</label>
            <select
              className={`${inputClass} cursor-pointer`}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg text-sm text-[var(--text-secondary)]">
          Belum ada penjualan untuk filter ini. Coba pilih periode yang lebih panjang atau kategori lain.
        </div>
      ) : (
        <>
          <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
            <p className="font-semibold">5 Produk Terlaris</p>
            <p className="text-[var(--text-secondary)] text-[.8rem] mb-3">Berdasarkan jumlah terjual (pcs)</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top5} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#E2DCD5" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="product"
                    width={110}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v) => `${v} pcs`} cursor={{ fill: "#F4F1EA" }} />
                  <Bar dataKey="qty" name="Terjual" fill="#800000" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
            <p className="font-semibold">Peringkat Produk</p>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm min-w-120">
                <thead>
                  <tr className="text-left text-[var(--text-secondary)]">
                    <th className="py-2 font-medium w-10">#</th>
                    <th className="py-2 font-medium">Produk</th>
                    <th className="py-2 font-medium">Kategori</th>
                    <th className="py-2 font-medium text-right">Terjual</th>
                    <th className="py-2 font-medium text-right">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => (
                    <tr key={p.product} className="border-t border-gray-200">
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2 font-medium">{p.product}</td>
                      <td className="py-2">
                        <span className={`text-[.75rem] px-2 py-0.5 rounded font-medium ${categoryClass(p.category)}`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2 text-right">{p.qty} pcs</td>
                      <td className="py-2 text-right font-semibold">{formatRupiah(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}