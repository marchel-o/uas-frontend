'use client'

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

const tabs = [
  { name: "Ringkasan", link: "/main/laporan" },
  { name: "Harian", link: "/main/laporan/harian" },
  { name: "Mingguan", link: "/main/laporan/mingguan" },
  { name: "Bulanan", link: "/main/laporan/bulanan" },
  { name: "Produk Terlaris", link: "/main/laporan/produk-terlaris" },
]

export default function LaporanLayout({ children }: { children: ReactNode }) {
  const pathName = usePathname()

  return (
    <>
      <div>
        <h1 className="font-bold text-2xl">Laporan Penjualan</h1>
        <p className="text-[var(--text-secondary)] text-sm">Rekap dan analisis transaksi toko.</p>
      </div>

      <div className="no-print flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = pathName === tab.link

          return (
            <a
              key={tab.link}
              href={tab.link}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface)] border border-[var(--border)] hover:bg-gray-100"
              }`}
            >
              {tab.name}
            </a>
          )
        })}
      </div>

      {children}
    </>
  )
}