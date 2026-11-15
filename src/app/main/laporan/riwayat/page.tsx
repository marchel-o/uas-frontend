'use client'

import { useState } from "react"
import { Banknote, Download, Printer, ShoppingCart } from "lucide-react"
import {
  Transaction,
  filterRange,
  formatDate,
  formatRupiah,
  itemsText,
  summarize,
  txTotal,
} from "../data"
import { ReportStatus, useReportData } from "../useReportData"
import { StatCard, inputClass } from "../ui"

const PAGE_SIZE = 10

const primaryButton =
  "flex items-center justify-center gap-2 p-2 px-3 text-sm bg-[var(--primary)] text-white rounded-lg cursor-pointer hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"

const outlineButton =
  "flex items-center justify-center gap-2 p-2 px-3 text-sm border border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"

function toCsv(list: Transaction[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const header = ["Invoice", "Tanggal", "Waktu", "Produk", "Kategori", "Jumlah", "Harga", "Subtotal"]
  const rows = list.flatMap((t) =>
    t.items.map((i) => [t.id, t.date, t.time, i.product, i.category, i.qty, i.price, i.qty * i.price])
  )
  const body = [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n")
  // "sep=;" supaya Excel (termasuk yang berlocale Indonesia) memisahkan kolom dengan benar
  return "\uFEFFsep=;\r\n" + body
}

export default function Riwayat() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [visible, setVisible] = useState(PAGE_SIZE)
  const { transactions, loading, error } = useReportData()

  if (loading || error) return <ReportStatus loading={loading} error={error} />

  const invalid = !!from && !!to && from > to
  const list = invalid ? [] : filterRange(transactions, from, to)
  const sum = summarize(list)
  const shown = list.slice(0, visible)

  const periodText =
    from || to ? `${from ? formatDate(from) : "Awal"} - ${to ? formatDate(to) : "Sekarang"}` : "Semua tanggal"

  const changeFrom = (v: string) => {
    setFrom(v)
    setVisible(PAGE_SIZE)
  }
  const changeTo = (v: string) => {
    setTo(v)
    setVisible(PAGE_SIZE)
  }
  const reset = () => {
    setFrom("")
    setTo("")
    setVisible(PAGE_SIZE)
  }

  const exportExcel = () => {
    const blob = new Blob([toCsv(list)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `laporan-penjualan-${from || "awal"}-${to || "sekarang"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    // tampilkan semua baris dulu, lalu buka dialog cetak (pilih "Save as PDF")
    setVisible(list.length || PAGE_SIZE)
    setTimeout(() => window.print(), 100)
  }

  return (
    <>
      <div className="no-print rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <p className="font-semibold">Filter Tanggal</p>

        <div className="flex flex-wrap items-end gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Dari</label>
            <input type="date" className={inputClass} value={from} onChange={(e) => changeFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Sampai</label>
            <input type="date" className={inputClass} value={to} onChange={(e) => changeTo(e.target.value)} />
          </div>
          <button className={outlineButton} onClick={reset} disabled={!from && !to}>
            Reset
          </button>
        </div>

        {invalid && (
          <p className="text-red-500 text-[.8rem] mt-2">Tanggal awal harus sebelum atau sama dengan tanggal akhir.</p>
        )}
      </div>

      <p className="hidden print:block text-sm">Periode: {periodText}</p>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
        <StatCard icon={<Banknote size={18} />} title="Total Pendapatan" value={formatRupiah(sum.revenue)} />
        <StatCard icon={<ShoppingCart size={18} />} title="Jumlah Transaksi" value={sum.count} unit="transaksi" />
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <p className="font-semibold">Riwayat Transaksi</p>

          <div className="no-print flex gap-2">
            <button className={primaryButton} onClick={exportExcel} disabled={list.length === 0}>
              <Download size={16} /> Excel
            </button>
            <button className={outlineButton} onClick={exportPdf} disabled={list.length === 0}>
              <Printer size={16} /> PDF
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--text-secondary)]">
            {invalid
              ? "Perbaiki rentang tanggal untuk melihat transaksi."
              : "Tidak ada transaksi pada rentang tanggal ini."}
            {(from || to) && !invalid && (
              <div>
                <button className="mt-2 text-blue-600 cursor-pointer" onClick={reset}>
                  Tampilkan semua transaksi
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm min-w-120">
                <thead>
                  <tr className="text-left text-[var(--text-secondary)]">
                    <th className="py-2 font-medium">Invoice</th>
                    <th className="py-2 font-medium">Waktu</th>
                    <th className="py-2 font-medium">Item</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((t) => (
                    <tr key={t.id} className="border-t border-gray-200 align-top">
                      <td className="py-2 font-medium">{t.id}</td>
                      <td className="py-2 whitespace-nowrap">
                        {formatDate(t.date)}
                        <span className="block text-[var(--text-secondary)] text-[.8rem]">{t.time}</span>
                      </td>
                      <td className="py-2 pr-3 text-[var(--text-secondary)]">{itemsText(t)}</td>
                      <td className="py-2 text-right font-semibold">{formatRupiah(txTotal(t))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="no-print flex items-center justify-between mt-3 text-sm text-[var(--text-secondary)]">
              <p>
                Menampilkan {shown.length} dari {list.length} transaksi
              </p>
              {shown.length < list.length && (
                <button className="text-blue-600 cursor-pointer" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Tampilkan lebih banyak
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}