import type { ReactNode } from "react";
import { LaporanTabs } from "@/components/laporan/LaporanTabs";

export default function LaporanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <main className="mx-auto flex max-w-250 flex-col gap-4 p-4 sm:p-8 [&_a]:cursor-pointer [&_button]:cursor-pointer [&_select]:cursor-pointer">
        <h1 className="text-2xl font-bold">Laporan</h1>
        <LaporanTabs />
        {children}
      </main>
    </div>
  );
}