'use client'

import { kelompokkanBulanan } from "@/app/lib/laporan/data";
import { PeriodeView } from "./PeriodeView";

const opsi = [
  { nilai: "3", label: "3 bulan terakhir" },
  { nilai: "6", label: "6 bulan terakhir" },
];

export function BulananView() {
  return (
    <PeriodeView
      judul="Laporan penjualan bulanan"
      satuan="bulan"
      opsi={opsi}
      bawaan="6"
      kelompokkan={kelompokkanBulanan}
    />
  );
}