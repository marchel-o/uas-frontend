'use client'

import { useEffect, useState, type ReactNode } from "react";
import { ambilLaporan, DATA_CONTOH, type Laporan } from "@/app/lib/laporan/data";
import { fokus, kartu } from "@/app/components/ui/gaya";

type Status =
  | { jenis: "memuat" }
  | { jenis: "gagal" }
  | { jenis: "siap"; laporan: Laporan };

export function LaporanData({
  children,
}: {
  children: (laporan: Laporan) => ReactNode;
}) {
  const [percobaan, setPercobaan] = useState(0);
  const [status, setStatus] = useState<Status>({ jenis: "memuat" });

  useEffect(() => {
    let batal = false;
    ambilLaporan().then(
      (laporan) => {
        if (!batal) setStatus({ jenis: "siap", laporan });
      },
      () => {
        if (!batal) setStatus({ jenis: "gagal" });
      },
    );
    return () => {
      batal = true;
    };
  }, [percobaan]);

  const muatUlang = () => {
    setStatus({ jenis: "memuat" });
    setPercobaan((n) => n + 1);
  };

  if (status.jenis === "memuat") {
    return (
      <div role="status" className={kartu}>
        <p className="text-[var(--text-secondary)]">Memuat laporan...</p>
      </div>
    );
  }

  if (status.jenis === "gagal") {
    return (
      <div role="alert" className={kartu}>
        <p className="font-semibold">Laporan gagal dimuat.</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Data penjualan belum bisa diambil. Coba muat ulang.
        </p>
        <button
          type="button"
          onClick={muatUlang}
          className={`mt-3 min-h-11 rounded-md bg-[var(--primary)] px-4 font-semibold text-[var(--text-light)] hover:bg-[var(--primary-hover)] active:brightness-90 ${fokus}`}
        >
          Muat ulang laporan
        </button>
      </div>
    );
  }

  if (status.laporan.harian.length === 0) {
    return (
      <div className={kartu}>
        <p className="font-semibold">Belum ada transaksi.</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Laporan terisi setelah transaksi pertama dicatat.
        </p>
      </div>
    );
  }

  return (
    <>
      {DATA_CONTOH && (
        <p className="rounded-md border border-dashed border-[color:var(--text-secondary)] p-3 text-sm text-[var(--text-secondary)]">
          Data contoh. Angka di halaman ini belum berasal dari database transaksi.
        </p>
      )}
      {children(status.laporan)}
    </>
  );
}