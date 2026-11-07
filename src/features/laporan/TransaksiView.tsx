'use client'

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  dariKunci,
  jumlahkan,
  produkDari,
  rekapHarian,
  type Laporan,
} from "@/app/lib/laporan/data";
import { unduhExcel, unduhPdf } from "@/app/lib/laporan/ekspor";
import { angka, rupiah } from "@/app/lib/format";
import { fokus, kartu } from "@/components/ui/gaya";
import { LaporanData } from "@/components/laporan/LaporanData";
import { Tabel } from "@/components/ui/Tabel";

const UKURAN_HALAMAN = 20;

const tgl = (kunci: string) =>
  dariKunci(kunci).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const kolomTanggal = `min-h-11 rounded-md border border-[color:var(--text-secondary)] bg-[var(--surface)] px-3 text-sm hover:border-[color:var(--text-primary)] ${fokus}`;
const tombolUtama = `inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--text-light)] hover:bg-[var(--primary-hover)] active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50 ${fokus}`;
const tombolSekunder = `min-h-11 rounded-md border border-[color:var(--text-secondary)] px-4 text-sm font-semibold hover:bg-[var(--surface)] active:bg-[var(--border)] disabled:cursor-not-allowed disabled:opacity-50 ${fokus}`;

export function TransaksiView() {
  return <LaporanData>{(laporan) => <Riwayat laporan={laporan} />}</LaporanData>;
}

function Riwayat({ laporan }: { laporan: Laporan }) {
  const { transaksi, harian } = laporan;
  const awalData = harian[0].tanggal;
  const akhirData = harian[harian.length - 1].tanggal;
  const awalBawaan = harian[Math.max(0, harian.length - 7)].tanggal;

  const [dari, setDari] = useState(awalBawaan);
  const [sampai, setSampai] = useState(akhirData);
  const [halaman, setHalaman] = useState(1);
  const [mengekspor, setMengekspor] = useState<"pdf" | "excel" | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const rentangValid = dari !== "" && sampai !== "" && dari <= sampai;
  const terpilih = rentangValid
    ? transaksi.filter((t) => t.tanggal >= dari && t.tanggal <= sampai)
    : [];

  const rekap = rekapHarian(terpilih);
  const total = jumlahkan(rekap);
  const produk = produkDari(terpilih).sort((a, b) => b.terjual - a.terjual);
  const rata = total.transaksi === 0 ? 0 : Math.round(total.pendapatan / total.transaksi);

  const terurut = [...terpilih].reverse();
  const jumlahHalaman = Math.max(1, Math.ceil(terurut.length / UKURAN_HALAMAN));
  const aktif = Math.min(halaman, jumlahHalaman);
  const baris = terurut
    .slice((aktif - 1) * UKURAN_HALAMAN, aktif * UKURAN_HALAMAN)
    .map((t) => ({
      id: t.id,
      sel: {
        id: t.id,
        waktu: `${tgl(t.tanggal)}, ${t.jam}`,
        item: t.item.map((i) => `${i.produk} x${i.jumlah}`).join(", "),
        jumlah: angka(t.jumlahProduk),
        total: rupiah(t.total),
      },
    }));

  const ubahDari = (nilai: string) => {
    setDari(nilai);
    setHalaman(1);
  };
  const ubahSampai = (nilai: string) => {
    setSampai(nilai);
    setHalaman(1);
  };
  const aturUlang = () => {
    setDari(awalBawaan);
    setSampai(akhirData);
    setHalaman(1);
  };

  const ekspor = async (jenis: "pdf" | "excel") => {
    setMengekspor(jenis);
    setGalat(null);
    try {
      const data = { dari, sampai, total, harian: rekap, produk, transaksi: terpilih };
      await (jenis === "pdf" ? unduhPdf(data) : unduhExcel(data));
    } catch {
      setGalat(`Gagal membuat file ${jenis === "pdf" ? "PDF" : "Excel"}. Coba lagi.`);
    } finally {
      setMengekspor(null);
    }
  };

  const tidakBisaEkspor = terpilih.length === 0 || mengekspor !== null;

  return (
    <>
      <h2 className="text-lg font-semibold">Riwayat transaksi</h2>

      <section aria-label="Filter tanggal dan ekspor" className={kartu}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="tanggal-dari" className="text-sm font-semibold">
              Dari tanggal
            </label>
            <input
              id="tanggal-dari"
              type="date"
              value={dari}
              min={awalData}
              max={akhirData}
              onChange={(e) => ubahDari(e.target.value)}
              className={kolomTanggal}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="tanggal-sampai" className="text-sm font-semibold">
              Sampai tanggal
            </label>
            <input
              id="tanggal-sampai"
              type="date"
              value={sampai}
              min={awalData}
              max={akhirData}
              onChange={(e) => ubahSampai(e.target.value)}
              className={kolomTanggal}
            />
          </div>

          <button type="button" onClick={aturUlang} className={tombolSekunder}>
            Atur ulang
          </button>

          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => ekspor("pdf")}
              disabled={tidakBisaEkspor}
              className={tombolUtama}
            >
              <FileText size={18} aria-hidden="true" />
              {mengekspor === "pdf" ? "Membuat PDF..." : "Unduh PDF"}
            </button>
            <button
              type="button"
              onClick={() => ekspor("excel")}
              disabled={tidakBisaEkspor}
              className={tombolUtama}
            >
              <FileSpreadsheet size={18} aria-hidden="true" />
              {mengekspor === "excel" ? "Membuat Excel..." : "Unduh Excel"}
            </button>
          </div>
        </div>

        {!rentangValid && (
          <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
            {dari === "" || sampai === ""
              ? "Isi tanggal awal dan tanggal akhir."
              : "Tanggal awal tidak boleh setelah tanggal akhir."}
          </p>
        )}
        {galat && (
          <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
            {galat}
          </p>
        )}
      </section>

      {terpilih.length === 0 ? (
        <div className={kartu}>
          <p className="font-semibold">Tidak ada transaksi pada rentang ini.</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Ubah tanggal atau atur ulang filter.
          </p>
        </div>
      ) : (
        <>
          <section
            aria-labelledby="judul-total"
            className={`${kartu} border-t-4 border-[color:var(--accent)]`}
          >
            <h3 id="judul-total" className="text-sm font-semibold text-[var(--text-secondary)]">
              Total pendapatan
            </h3>
            <p className="mt-1 text-3xl font-bold sm:text-4xl">{rupiah(total.pendapatan)}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {tgl(dari)} sampai {tgl(sampai)}
            </p>

            <dl className="mt-5 grid gap-4 border-t border-[color:var(--border)] pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-[var(--text-secondary)]">Jumlah transaksi</dt>
                <dd className="mt-0.5 text-lg font-semibold">{angka(total.transaksi)}</dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--text-secondary)]">Produk terjual</dt>
                <dd className="mt-0.5 text-lg font-semibold">{angka(total.produkTerjual)}</dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--text-secondary)]">Rata-rata per transaksi</dt>
                <dd className="mt-0.5 text-lg font-semibold">{rupiah(rata)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="judul-produk-teratas" className={kartu}>
            <h3 id="judul-produk-teratas" className="font-semibold">
              Produk terlaris pada rentang ini
            </h3>
            <ol className="mt-2 divide-y divide-[color:var(--border)]">
              {produk.slice(0, 5).map((p, i) => (
                <li key={p.nama} className="flex items-baseline gap-3 py-2">
                  <span className="w-5 text-sm tabular-nums text-[var(--text-secondary)]">
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium">{p.nama}</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {angka(p.terjual)} terjual
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-label="Tabel riwayat transaksi" className={kartu}>
            <Tabel
              keterangan={`Riwayat transaksi, terbaru di atas, halaman ${aktif} dari ${jumlahHalaman}`}
              kolom={[
                { kunci: "id", judul: "ID transaksi" },
                { kunci: "waktu", judul: "Waktu" },
                { kunci: "item", judul: "Item" },
                { kunci: "jumlah", judul: "Jumlah produk", kanan: true },
                { kunci: "total", judul: "Total", kanan: true },
              ]}
              baris={baris}
            />

            <nav
              aria-label="Halaman riwayat transaksi"
              className="mt-3 flex flex-wrap items-center justify-between gap-3"
            >
              <button
                type="button"
                onClick={() => setHalaman(aktif - 1)}
                disabled={aktif === 1}
                className={tombolSekunder}
              >
                Sebelumnya
              </button>
              <p className="text-sm text-[var(--text-secondary)]" aria-live="polite">
                Halaman {aktif} dari {jumlahHalaman}, {angka(terurut.length)} transaksi
              </p>
              <button
                type="button"
                onClick={() => setHalaman(aktif + 1)}
                disabled={aktif === jumlahHalaman}
                className={tombolSekunder}
              >
                Berikutnya
              </button>
            </nav>
          </section>
        </>
      )}
    </>
  );
}