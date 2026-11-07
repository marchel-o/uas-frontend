'use client'

import { useState } from "react";
import type { ProdukTerlaris } from "@/app/lib/laporan/data";
import { angka, rupiah } from "@/app/lib/format";
import { FotoProduk } from "@/app/components/ui/FotoProduk";
import { kartu } from "@/app/components/ui/gaya";
import { LaporanData } from "@/app/components/laporan/LaporanData";
import { PilihanSelect } from "@/app/components/ui/PilihanSelect";
import { Tabel } from "@/app/components/ui/Tabel";

type Urutan = "terjual" | "pendapatan";

const opsi = [
  { nilai: "terjual", label: "Jumlah terjual" },
  { nilai: "pendapatan", label: "Pendapatan" },
];

export function ProdukView() {
  return <LaporanData>{({ produk }) => <Produk produk={produk} />}</LaporanData>;
}

function Produk({ produk }: { produk: ProdukTerlaris[] }) {
  const [urut, setUrut] = useState<Urutan>("terjual");

  const terurut = [...produk].sort((a, b) => b[urut] - a[urut]);
  const total = terurut.reduce((a, p) => a + p[urut], 0);

  const baris = terurut.map((p, i) => {
    const porsi = total === 0 ? 0 : (p[urut] / total) * 100;
    return {
      id: p.nama,
      sel: {
        peringkat: i + 1,
        nama: (
          <div className="flex items-center gap-3">
            <FotoProduk src={p.gambar} ukuran={48} />
            <div>
              <div className="font-medium">{p.nama}</div>
              <div className="text-xs text-[var(--text-secondary)]">{p.kategori}</div>
            </div>
          </div>
        ),
        terjual: angka(p.terjual),
        pendapatan: rupiah(p.pendapatan),
        porsi: (
          <div className="flex items-center justify-end gap-2">
            <div aria-hidden="true" className="h-2 w-20 rounded-sm bg-[var(--border)]">
              <div
                className="h-full rounded-sm bg-[var(--primary)]"
                style={{ width: `${porsi}%` }}
              />
            </div>
            <span className="w-12">
              {porsi.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
            </span>
          </div>
        ),
      },
    };
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Produk terlaris, 30 hari terakhir</h2>
        <PilihanSelect
          id="urutan-produk"
          label="Urutkan"
          nilai={urut}
          opsi={opsi}
          onUbah={(v) => setUrut(v as Urutan)}
        />
      </div>

      <section aria-label="Tabel produk terlaris" className={kartu}>
        <Tabel
          keterangan={`Produk terlaris, diurutkan berdasarkan ${urut === "terjual" ? "jumlah terjual" : "pendapatan"}`}
          kolom={[
            { kunci: "peringkat", judul: "Peringkat" },
            { kunci: "nama", judul: "Produk" },
            { kunci: "terjual", judul: "Terjual", kanan: true },
            { kunci: "pendapatan", judul: "Pendapatan", kanan: true },
            {
              kunci: "porsi",
              judul: urut === "terjual" ? "Porsi jumlah terjual" : "Porsi pendapatan",
              kanan: true,
            },
          ]}
          baris={baris}
        />
      </section>
    </>
  );
}