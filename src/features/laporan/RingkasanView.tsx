'use client'

import Link from "next/link";
import { bandingkanBulan, dariKunci, selisihPersen, type Laporan } from "@/app/lib/laporan/data";
import { angka, rupiah, tanggalPendek } from "@/app/lib/format";
import { GrafikBatang } from "@/components/ui/Grafik";
import { FotoProduk } from "@/components/ui/FotoProduk";
import { kartu, tautan } from "@/components/ui/gaya";
import { LaporanData } from "@/components/laporan/LaporanData";
import { Perubahan } from "@/components/laporan/Perubahan";

export function RingkasanView() {
  return <LaporanData>{(laporan) => <Ringkasan laporan={laporan} />}</LaporanData>;
}

function Ringkasan({ laporan }: { laporan: Laporan }) {
  const banding = bandingkanBulan(laporan.harian);
  if (!banding) return null;

  const { sekarang, sebelum } = banding;
  const rata = (t: { pendapatan: number; transaksi: number }) =>
    t.transaksi === 0 ? 0 : t.pendapatan / t.transaksi;

  const metrik = [
    {
      judul: "Transaksi",
      nilai: angka(sekarang.transaksi),
      ubah: selisihPersen(sekarang.transaksi, sebelum.transaksi),
    },
    {
      judul: "Produk terjual",
      nilai: angka(sekarang.produkTerjual),
      ubah: selisihPersen(sekarang.produkTerjual, sebelum.produkTerjual),
    },
    {
      judul: "Rata-rata per transaksi",
      nilai: rupiah(Math.round(rata(sekarang))),
      ubah: selisihPersen(rata(sekarang), rata(sebelum)),
    },
  ];

  const grafik = laporan.harian.slice(-30).map((h) => ({
    label: tanggalPendek(dariKunci(h.tanggal)),
    nilai: h.pendapatan,
  }));
  const teratas = [...laporan.produk].sort((a, b) => b.terjual - a.terjual).slice(0, 5);

  return (
    <>
      <section
        aria-labelledby="judul-pendapatan"
        className={`${kartu} border-t-4 border-[color:var(--accent)]`}
      >
        <h2 id="judul-pendapatan" className="text-sm font-semibold text-[var(--text-secondary)]">
          Pendapatan bulan ini
        </h2>
        <p className="mt-1 text-3xl font-bold sm:text-4xl">{rupiah(sekarang.pendapatan)}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-[var(--text-secondary)]">
          <Perubahan nilai={selisihPersen(sekarang.pendapatan, sebelum.pendapatan)} />
          <span>
            {banding.labelSekarang}, dibanding {banding.labelSebelum}
          </span>
        </p>

        <dl className="mt-5 grid gap-4 border-t border-[color:var(--border)] pt-4 sm:grid-cols-3">
          {metrik.map((m) => (
            <div key={m.judul}>
              <dt className="text-sm text-[var(--text-secondary)]">{m.judul}</dt>
              <dd className="mt-0.5 text-lg font-semibold">{m.nilai}</dd>
              <dd className="text-sm">
                <Perubahan nilai={m.ubah} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="judul-grafik" className={kartu}>
        <h2 id="judul-grafik" className="font-semibold">
          Pendapatan 30 hari terakhir
        </h2>
        <div className="mt-3">
          <GrafikBatang
            data={grafik}
            deskripsi="Grafik batang pendapatan harian selama 30 hari terakhir. Angka lengkap ada di laporan harian."
          />
        </div>
        <Link href="/laporan/harian" className={tautan}>
          Buka laporan harian
        </Link>
      </section>

      <section aria-labelledby="judul-teratas" className={kartu}>
        <h2 id="judul-teratas" className="font-semibold">
          Lima produk terlaris, 30 hari terakhir
        </h2>
        <ol className="mt-2 divide-y divide-[color:var(--border)]">
          {teratas.map((p, i) => (
            <li key={p.nama} className="flex items-center gap-3 py-2">
              <span className="w-5 text-sm tabular-nums text-[var(--text-secondary)]">{i + 1}</span>
              <FotoProduk src={p.gambar} ukuran={40} />
              <span className="flex-1 font-medium">{p.nama}</span>
              <span className="text-sm text-[var(--text-secondary)]">
                {angka(p.terjual)} terjual
              </span>
            </li>
          ))}
        </ol>
        <Link href="/laporan/produk-terlaris" className={tautan}>
          Buka semua produk terlaris
        </Link>
      </section>
    </>
  );
}