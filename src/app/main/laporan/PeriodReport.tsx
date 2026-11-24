'use client'

import { useState } from "react"
import { Banknote, PackageCheck, ShoppingCart, TrendingUp } from "lucide-react"
import {
  TODAY,
  addDays,
  filterRange,
  formatDate,
  formatRupiah,
  groupByDay,
  groupByHour,
  itemsText,
  lastDayOfMonth,
  summarize,
  txTotal,
} from "./data"
import { ReportStatus, useReportData } from "./useReportData"
import { RevenueChart, StatCard, inputClass } from "./ui"

type Mode = "daily" | "weekly" | "monthly"

const copy: Record<Mode, { label: string; title: string }> = {
  daily: { label: "Tanggal", title: "Pendapatan per Jam" },
  weekly: { label: "Sampai tanggal", title: "Pendapatan 7 Hari" },
  monthly: { label: "Bulan", title: "Pendapatan per Hari" },
}

export function PeriodReport({ mode }: { mode: Mode }) {
  const [date, setDate] = useState(TODAY)
  const [month, setMonth] = useState(TODAY.slice(0, 7))
  const { transactions, loading, error } = useReportData()

  if (loading || error) return <ReportStatus loading={loading} error={error} />

  const valid = mode === "monthly" ? /^\d{4}-\d{2}$/.test(month) : /^\d{4}-\d{2}-\d{2}$/.test(date)

  let from = ""
  let to = ""
  if (valid) {
    if (mode === "daily") {
      from = date
      to = date
    } else if (mode === "weekly") {
      from = addDays(date, -6)
      to = date
    } else {
      from = `${month}-01`
      to = lastDayOfMonth(month)
    }
  }

  const list = valid ? filterRange(transactions, from, to) : []
  const sum = summarize(list)
  const days = valid ? groupByDay(list, from, to) : []

  const chartData =
    mode === "daily"
      ? groupByHour(list)
      : days.map((d) => ({
          label: mode === "monthly" ? String(Number(d.date.slice(8))) : `${d.date.slice(8)}/${d.date.slice(5, 7)}`,
          revenue: d.revenue,
        }))

  return (
    <>
      <div className="no-print flex flex-col gap-1.5 w-fit">
        <label className="text-sm font-medium">{copy[mode].label}</label>
        {mode === "monthly" ? (
          <input type="month" className={inputClass} value={month} onChange={(e) => setMonth(e.target.value)} />
        ) : (
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        )}
      </div>

      {!valid ? (
        <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg text-sm text-[var(--text-secondary)]">
          {mode === "monthly" ? "Pilih bulan terlebih dahulu." : "Pilih tanggal terlebih dahulu."}
        </div>
      ) : (
        <>
          <p className="text-[var(--text-secondary)] text-sm">
            Periode: {from === to ? formatDate(from) : `${formatDate(from)} - ${formatDate(to)}`}
          </p>

          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
            <StatCard icon={<Banknote size={18} />} title="Total Pendapatan" value={formatRupiah(sum.revenue)} />
            <StatCard icon={<ShoppingCart size={18} />} title="Jumlah Transaksi" value={sum.count} unit="transaksi" />
            <StatCard icon={<PackageCheck size={18} />} title="Produk Terjual" value={sum.qty} unit="pcs" />
            <StatCard icon={<TrendingUp size={18} />} title="Rata-rata per Transaksi" value={formatRupiah(sum.avg)} />
          </div>

          {list.length === 0 ? (
            <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg text-sm text-[var(--text-secondary)]">
              Belum ada transaksi pada periode ini. Coba pilih {mode === "monthly" ? "bulan" : "tanggal"} lain.
            </div>
          ) : (
            <>
              <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                <p className="font-semibold mb-3">{copy[mode].title}</p>
                <RevenueChart data={chartData} />
              </div>

              <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                {mode === "daily" ? (
                  <>
                    <p className="font-semibold">Transaksi</p>
                    <div className="flex flex-col gap-3 mt-4">
                      {[...list].sort((a, b) => a.time.localeCompare(b.time)).map((t) => (
                        <div key={t.id} className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium">{t.id}</p>
                            <p className="text-sm text-[var(--text-secondary)] font-semibold">{t.time}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{itemsText(t)}</p>
                          </div>
                          <p className="font-semibold shrink-0">{formatRupiah(txTotal(t))}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Rincian per Hari</p>
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-sm min-w-80">
                        <thead>
                          <tr className="text-left text-[var(--text-secondary)]">
                            <th className="py-2 font-medium">Tanggal</th>
                            <th className="py-2 font-medium text-right">Transaksi</th>
                            <th className="py-2 font-medium text-right">Pendapatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {days.map((d) => (
                            <tr key={d.date} className="border-t border-gray-200">
                              <td className="py-2">{formatDate(d.date)}</td>
                              <td className="py-2 text-right">{d.count}</td>
                              <td className="py-2 text-right font-semibold">{formatRupiah(d.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}