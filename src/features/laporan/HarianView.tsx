'use client'

import { useState } from "react";
import { dariKunci, jumlahkan, type HariPenjualan } from "@/app/lib/laporan/data";
import { angka, rupiah, tanggalHari, tanggalPendek } from "@/app/lib/format";
import { GrafikBatang } from "@/components/ui/Grafik";
import { kartu } from "@/components/ui/gaya";
import { LaporanData } from "@/components/laporan/LaporanData";
import { PilihanSelect } from "@/components/ui/PilihanSelect";
import { Tabel } from "@/components/ui/Tabel";

const opsi = [
  { nilai: "7", label: "7 hari terakhir" },
  { nilai: "14", label: "14 hari terakhir" },
  { nilai: "30", label: "30 hari terakhir" },
];

export function HarianView() {
  return <LaporanData>{({ harian }) => <Harian harian={harian} />}</LaporanData>;
}

function Harian({ harian }: { harian: HariPenjualan[] }) {
  const [hari, setHari] = useState("14");
  const data = harian.slice(-Number(hari));
  const total = jumlahkan(data);

  const grafik = data.map((h) => ({
    label: tanggalPendek(dariKunci(h.tanggal)),
    nilai: h.pendapatan,
  }));
  const baris = [...data].reverse().map((h) => ({
    id: h.tanggal,
    sel: {
      tanggal: tanggalHari(dariKunci(h.tanggal)),
      transaksi: angka(h.transaksi),
      produk: angka(h.produkTerjual),
      pendapatan: rupiah(h.pendapatan),
    },
  }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Laporan penjualan harian</h2>
        <PilihanSelect id="rentang-harian" label="Rentang" nilai={hari} opsi={opsi} onUbah={setHari} />
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        Total {hari} hari terakhir, termasuk hari ini: {rupiah(total.pendapatan)} dari{" "}
        {angka(total.transaksi)} transaksi dan {angka(total.produkTerjual)} produk terjual.
      </p>

      <section aria-label="Grafik pendapatan harian" className={kartu}>
        <GrafikBatang
          data={grafik}
          deskripsi={`Grafik batang pendapatan per hari selama ${hari} hari terakhir. Angka lengkap ada di tabel di bawahnya.`}
        />
      </section>

      <section aria-label="Tabel penjualan harian" className={kartu}>
        <Tabel
          keterangan={`Penjualan per hari, ${hari} hari terakhir, terbaru di atas`}
          kolom={[
            { kunci: "tanggal", judul: "Tanggal" },
            { kunci: "transaksi", judul: "Transaksi", kanan: true },
            { kunci: "produk", judul: "Produk terjual", kanan: true },
            { kunci: "pendapatan", judul: "Pendapatan", kanan: true },
          ]}
          baris={baris}
        />
      </section>
    </>
  );
}