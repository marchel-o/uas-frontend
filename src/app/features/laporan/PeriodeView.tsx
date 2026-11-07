'use client'

import { useState } from "react";
import { selisihPersen, type HariPenjualan, type Periode } from "@/app/lib/laporan/data";
import { angka, rupiah } from "@/app/lib/format";
import { GrafikBatang } from "@/app/components/ui/Grafik";
import { kartu } from "@/app/components/ui/gaya";
import { LaporanData } from "@/app/components/laporan/LaporanData";
import { Perubahan } from "@/app/components/laporan/Perubahan";
import { PilihanSelect } from "@/app/components/ui/PilihanSelect";
import { Tabel } from "@/app/components/ui/Tabel";

type Props = {
  judul: string;
  satuan: "minggu" | "bulan";
  opsi: { nilai: string; label: string }[];
  bawaan: string;
  kelompokkan: (harian: HariPenjualan[]) => Periode[];
};

export function PeriodeView(props: Props) {
  return (
    <LaporanData>{({ harian }) => <Periodik harian={harian} {...props} />}</LaporanData>
  );
}

function Periodik({
  harian,
  judul,
  satuan,
  opsi,
  bawaan,
  kelompokkan,
}: Props & { harian: HariPenjualan[] }) {
  const [jumlah, setJumlah] = useState(bawaan);
  const semua = kelompokkan(harian).map((p, i, arr) => ({
    ...p,
    ubah: p.berjalan || i === 0 ? null : selisihPersen(p.pendapatan, arr[i - 1].pendapatan),
  }));
  const tampil = semua.slice(-Number(jumlah));

  const grafik = tampil.map((p) => ({ label: p.singkat, nilai: p.pendapatan }));
  const baris = [...tampil].reverse().map((p) => ({
    id: p.kunci,
    sel: {
      periode: p.berjalan ? `${p.label} (berjalan)` : p.label,
      transaksi: angka(p.transaksi),
      produk: angka(p.produkTerjual),
      pendapatan: rupiah(p.pendapatan),
      ubah: p.berjalan ? (
        <span className="text-[var(--text-secondary)]">Belum lengkap</span>
      ) : (
        <Perubahan nilai={p.ubah} />
      ),
    },
  }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{judul}</h2>
        <PilihanSelect
          id={`rentang-${satuan}`}
          label="Rentang"
          nilai={jumlah}
          opsi={opsi}
          onUbah={setJumlah}
        />
      </div>

      <section aria-label={`Grafik pendapatan per ${satuan}`} className={kartu}>
        <GrafikBatang
          data={grafik}
          deskripsi={`Grafik batang pendapatan per ${satuan}, ${jumlah} ${satuan} terakhir. Angka lengkap ada di tabel di bawahnya.`}
        />
      </section>

      <section aria-label={`Tabel penjualan per ${satuan}`} className={kartu}>
        <Tabel
          keterangan={`Penjualan per ${satuan}, ${jumlah} ${satuan} terakhir, terbaru di atas`}
          kolom={[
            { kunci: "periode", judul: satuan === "minggu" ? "Minggu" : "Bulan" },
            { kunci: "transaksi", judul: "Transaksi", kanan: true },
            { kunci: "produk", judul: "Produk terjual", kanan: true },
            { kunci: "pendapatan", judul: "Pendapatan", kanan: true },
            { kunci: "ubah", judul: `Dibanding ${satuan} lalu`, kanan: true },
          ]}
          baris={baris}
        />
      </section>
    </>
  );
}