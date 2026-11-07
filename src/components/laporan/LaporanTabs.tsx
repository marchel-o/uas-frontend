'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { fokus } from "@/components/ui/gaya";

const tab = [
  { nama: "Ringkasan", href: "/laporan" },
  { nama: "Transaksi", href: "/laporan/transaksi" },
  { nama: "Harian", href: "/laporan/harian" },
  { nama: "Mingguan", href: "/laporan/mingguan" },
  { nama: "Bulanan", href: "/laporan/bulanan" },
  { nama: "Produk terlaris", href: "/laporan/produk-terlaris" },
];

export function LaporanTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Jenis laporan" className="overflow-x-auto p-1">
      <ul className="flex w-max gap-1">
        {tab.map((t) => {
          const aktif = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm font-semibold ${fokus} ${
                  aktif
                    ? "bg-[var(--primary)] text-[var(--text-light)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--surface)] active:bg-[var(--border)]"
                }`}
              >
                {t.nama}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}