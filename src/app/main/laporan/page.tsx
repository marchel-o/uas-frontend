import { Banknote, CalendarRange, ShoppingCart, TrendingUp } from "lucide-react"
import { getReportData } from "@/lib/report-data"
import {
  TODAY,
  Transaction,
  addDays,
  categoryClass,
  filterRange,
  formatRupiah,
  groupByDay,
  summarize,
  topProducts,
} from "./data"
import { RevenueChart, StatCard } from "./ui"

export const dynamic = "force-dynamic"

function compare(current: number, previous: number, label: string) {
  if (previous === 0) return { text: "Belum ada pembanding", green: true }
  const pct = Math.round(((current - previous) / previous) * 100)
  return { text: `${pct >= 0 ? "+" : ""}${pct}% ${label}`, green: pct >= 0 }
}

export default async function Ringkasan() {
  let transactions: Transaction[] = []

  try {
    transactions = (await getReportData()).transactions
  } catch (error) {
    console.error(error)
    return (
      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg text-sm text-red-500">
        Gagal terhubung ke database. Pastikan MySQL menyala dan DATABASE_URL sudah benar.
      </div>
    )
  }

  const monthStart = `${TODAY.slice(0, 7)}-01`

  const today = summarize(filterRange(transactions, TODAY, TODAY))
  const yesterday = summarize(filterRange(transactions, addDays(TODAY, -1), addDays(TODAY, -1)))
  const month = summarize(filterRange(transactions, monthStart, TODAY))

  const last7 = groupByDay(filterRange(transactions, addDays(TODAY, -6), TODAY), addDays(TODAY, -6), TODAY).map(
    (d) => ({ label: `${d.date.slice(8)}/${d.date.slice(5, 7)}`, revenue: d.revenue })
  )

  const top3 = topProducts(filterRange(transactions, monthStart, TODAY)).slice(0, 3)

  return (
    <>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
        <StatCard
          icon={<Banknote size={18} />}
          title="Pendapatan Hari Ini"
          value={formatRupiah(today.revenue)}
          badge={compare(today.revenue, yesterday.revenue, "dari kemarin")}
        />
        <StatCard
          icon={<ShoppingCart size={18} />}
          title="Transaksi Hari Ini"
          value={today.count}
          unit="transaksi"
          badge={compare(today.count, yesterday.count, "dari kemarin")}
        />
        <StatCard
          icon={<CalendarRange size={18} />}
          title="Pendapatan Bulan Ini"
          value={formatRupiah(month.revenue)}
          unit={`${month.count} transaksi`}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          title="Rata-rata per Transaksi"
          value={formatRupiah(month.avg)}
          unit="bulan ini"
        />
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <p className="font-semibold">Pendapatan 7 Hari Terakhir</p>
        <p className="text-[var(--text-secondary)] text-[.8rem] mb-3">Per hari, dalam rupiah</p>
        <RevenueChart data={last7} />
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Produk Terlaris Bulan Ini</p>
          <a href="/main/laporan/produk-terlaris" className="text-blue-600 text-sm cursor-pointer">
            Lihat semua
          </a>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {top3.map((p, i) => (
            <div key={p.product} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 shrink-0 rounded-full bg-red-100 text-[var(--primary)] text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.product}</p>
                  <span className={`text-[.7rem] px-2 py-0.5 rounded font-medium ${categoryClass(p.category)}`}>
                    {p.category}
                  </span>
                </div>
              </div>
              <p className="font-semibold shrink-0">{p.qty} pcs</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}