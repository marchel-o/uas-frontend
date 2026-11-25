'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Daftar", href: "/main/stok" },
  { name: "Menipis", href: "/main/stok/menipis" },
  { name: "Masuk", href: "/main/stok/masuk" },
  { name: "Keluar", href: "/main/stok/keluar" },
  { name: "Opname", href: "/main/stok/opname" },
  { name: "Riwayat", href: "/main/stok/riwayat" },
];

export function StokTabs() {
  const pathName = usePathname();

  return (
    <nav aria-label="Menu stok" className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const active = pathName === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-all ${
              active
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-white"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
