'use client'

import { kelompokkanMingguan } from "@/app/lib/laporan/data";
import { PeriodeView } from "./PeriodeView";

const opsi = [
  { nilai: "4", label: "4 minggu terakhir" },
  { nilai: "8", label: "8 minggu terakhir" },
  { nilai: "12", label: "12 minggu terakhir" },
];

export function MingguanView() {
  return (
    <PeriodeView
      judul="Laporan penjualan mingguan"
      satuan="minggu"
      opsi={opsi}
      bawaan="8"
      kelompokkan={kelompokkanMingguan}
    />
  );
}