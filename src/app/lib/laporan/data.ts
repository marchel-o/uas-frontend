export const DATA_CONTOH = false;

export type ItemTransaksi = {
  produk: string;
  jumlah: number;
  harga: number;
};

export type Transaksi = {
  id: string;
  tanggal: string; 
  jam: string; 
  item: ItemTransaksi[];
  jumlahProduk: number;
  total: number;
};

export type HariPenjualan = {
  tanggal: string;
  transaksi: number;
  produkTerjual: number;
  pendapatan: number;
};

export type ProdukTerlaris = {
  nama: string;
  kategori: string;
  gambar: string;
  terjual: number;
  pendapatan: number;
};

export type Laporan = {
  transaksi: Transaksi[];
  harian: HariPenjualan[];
  produk: ProdukTerlaris[];
};

export type Total = {
  transaksi: number;
  produkTerjual: number;
  pendapatan: number;
};

export type Periode = Total & {
  kunci: string;
  label: string;
  singkat: string;
  berjalan: boolean;
};

const PRODUK_CONTOH = [
  { nama: "Aqua", kategori: "Air Mineral Kemasan", gambar: "/aqua.jpg", harga: 6500, bobot: 18 },
  { nama: "Le Minerale", kategori: "Air Mineral Kemasan", gambar: "/le-minerale.jpg", harga: 3500, bobot: 14 },
  { nama: "Vit", kategori: "Air Mineral Kemasan", gambar: "/vit.jpg", harga: 3000, bobot: 9 },
  { nama: "Mie Sedaap Mie Goreng", kategori: "Mie Instan", gambar: "/sedaap-mie-goreng.jpg", harga: 3500, bobot: 13 },
  { nama: "Indomie Ayam Geprek", kategori: "Mie Instan", gambar: "/indomie-ayam-geprek.jpg", harga: 3800, bobot: 10 },
  { nama: "Indomie Ayam Bawang", kategori: "Mie Instan", gambar: "/indomie-ayam-bawang.jpg", harga: 3300, bobot: 16 },
  { nama: "Kapal Api Spesial", kategori: "Kopi Instan & Kopi Kaleng", gambar: "/kapal-api-spesial.jpg", harga: 1500, bobot: 15 },
  { nama: "Starbucks Doubleshot Mocha", kategori: "Kopi Instan & Kopi Kaleng", gambar: "/starbucks-doubleshot-mocha.jpg", harga: 22000, bobot: 4 },
  { nama: "Indocafe Coffeemix", kategori: "Kopi Instan & Kopi Kaleng", gambar: "/indocafe-coffeemix.jpg", harga: 1800, bobot: 12 },
  { nama: "MyRoti Roti Sobek Cokelat Susu", kategori: "Roti Kemasan Praktis", gambar: "/myroti-sobek-cokelat-susu.jpg", harga: 14500, bobot: 6 },
  { nama: "Sari Roti Roti Sobek Cokelat Stroberi", kategori: "Roti Kemasan Praktis", gambar: "/sari-roti-sobek-cokelat-stroberi.jpg", harga: 13500, bobot: 7 },
  { nama: "Sari Roti Tawar", kategori: "Roti Kemasan Praktis", gambar: "/sari-roti-tawar.jpg", harga: 16500, bobot: 9 },
];

const KATALOG = new Map(PRODUK_CONTOH.map((p) => [p.nama, p]));

const TOTAL_BOBOT = PRODUK_CONTOH.reduce((a, p) => a + p.bobot, 0);

function acak(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function kunciTanggal(d: Date) {
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

export function dariKunci(kunci: string) {
  const [y, m, d] = kunci.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function pilihProduk(seed: number) {
  let sisa = acak(seed) * TOTAL_BOBOT;
  for (const p of PRODUK_CONTOH) {
    sisa -= p.bobot;
    if (sisa < 0) return p;
  }
  return PRODUK_CONTOH[PRODUK_CONTOH.length - 1];
}

function buatItem(seed: number): ItemTransaksi[] {
  const s = seed * 31;
  const baris = new Map<string, ItemTransaksi>();
  const banyak = 1 + Math.floor(acak(s + 20) * 3);

  for (let k = 0; k < banyak; k++) {
    const p = pilihProduk(s + k * 2);
    const jumlah = 1 + Math.floor(acak(s + k * 2 + 1) * 3);
    const ada = baris.get(p.nama);
    if (ada) ada.jumlah += jumlah;
    else baris.set(p.nama, { produk: p.nama, jumlah, harga: p.harga });
  }
  return [...baris.values()];
}

function buatTransaksi(): Transaksi[] {
  const sekarang = new Date();
  const kunciHariIni = kunciTanggal(sekarang);
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
  const awal = new Date(sekarang.getFullYear(), sekarang.getMonth() - 5, 1);
  const hasil: Transaksi[] = [];

  for (
    let d = new Date(awal), i = 0;
    d <= sekarang;
    d.setDate(d.getDate() + 1), i++
  ) {
    const akhirPekan = d.getDay() === 0 || d.getDay() === 6;
    const faktor = 0.8 + acak(i) * 0.5 + (akhirPekan ? 0.25 : 0);
    const banyak = Math.round(40 + faktor * 60);
    const kunci = kunciTanggal(d);

    // Jam operasional contoh 08:00 sampai 20:59; transaksi hari ini tidak melewati jam sekarang.
    const menit = Array.from(
      { length: banyak },
      (_, j) => 480 + Math.floor(acak(i * 1000 + j + 7) * 780),
    )
      .filter((m) => kunci !== kunciHariIni || m <= menitSekarang)
      .sort((a, b) => a - b);

    menit.forEach((m, j) => {
      const item = buatItem(i * 1000 + j);
      hasil.push({
        id: `TRX-${String(hasil.length + 1).padStart(5, "0")}`,
        tanggal: kunci,
        jam: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
        item,
        jumlahProduk: item.reduce((a, it) => a + it.jumlah, 0),
        total: item.reduce((a, it) => a + it.jumlah * it.harga, 0),
      });
    });
  }
  return hasil;
}

export function rekapHarian(transaksi: Transaksi[]): HariPenjualan[] {
  const peta = new Map<string, HariPenjualan>();
  for (const t of transaksi) {
    const h = peta.get(t.tanggal) ?? {
      tanggal: t.tanggal,
      transaksi: 0,
      produkTerjual: 0,
      pendapatan: 0,
    };
    h.transaksi += 1;
    h.produkTerjual += t.jumlahProduk;
    h.pendapatan += t.total;
    peta.set(t.tanggal, h);
  }
  return [...peta.values()].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

export function produkDari(transaksi: Transaksi[]): ProdukTerlaris[] {
  const peta = new Map<string, ProdukTerlaris>();
  for (const t of transaksi) {
    for (const it of t.item) {
      const info = KATALOG.get(it.produk);
      const p = peta.get(it.produk) ?? {
        nama: it.produk,
        kategori: info?.kategori ?? "",
        gambar: info?.gambar ?? "",
        terjual: 0,
        pendapatan: 0,
      };
      p.terjual += it.jumlah;
      p.pendapatan += it.jumlah * it.harga;
      peta.set(it.produk, p);
    }
  }
  return [...peta.values()];
}

export async function ambilLaporan(): Promise<Laporan> {
  const transaksi = buatTransaksi();
  const harian = rekapHarian(transaksi);
  const awal30 = harian.slice(-30)[0]?.tanggal ?? "";
  return {
    transaksi,
    harian,
    produk: produkDari(transaksi.filter((t) => t.tanggal >= awal30)),
  };
}

export const jumlahkan = (data: Total[]): Total =>
  data.reduce(
    (a, h) => ({
      transaksi: a.transaksi + h.transaksi,
      produkTerjual: a.produkTerjual + h.produkTerjual,
      pendapatan: a.pendapatan + h.pendapatan,
    }),
    { transaksi: 0, produkTerjual: 0, pendapatan: 0 },
  );

export function selisihPersen(sekarang: number, sebelum: number) {
  return sebelum === 0 ? null : ((sekarang - sebelum) / sebelum) * 100;
}

const fmtPendek = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

export function kelompokkanMingguan(harian: HariPenjualan[]): Periode[] {
  const grup = new Map<string, HariPenjualan[]>();
  for (const h of harian) {
    const d = dariKunci(h.tanggal);
    const senin = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() - ((d.getDay() + 6) % 7),
    );
    const kunci = kunciTanggal(senin);
    grup.set(kunci, [...(grup.get(kunci) ?? []), h]);
  }

  const hariIni = harian[harian.length - 1]?.tanggal;
  return [...grup.entries()].map(([kunci, data]) => {
    const senin = dariKunci(kunci);
    const minggu = new Date(
      senin.getFullYear(),
      senin.getMonth(),
      senin.getDate() + 6,
    );
    return {
      kunci,
      label: `${fmtPendek(senin)} sampai ${fmtPendek(minggu)}`,
      singkat: fmtPendek(senin),
      ...jumlahkan(data),
      berjalan: hariIni !== undefined && kunciTanggal(minggu) > hariIni,
    };
  });
}

export function kelompokkanBulanan(harian: HariPenjualan[]): Periode[] {
  const grup = new Map<string, HariPenjualan[]>();
  for (const h of harian) {
    const kunci = h.tanggal.slice(0, 7);
    grup.set(kunci, [...(grup.get(kunci) ?? []), h]);
  }

  const bulanIni = harian[harian.length - 1]?.tanggal.slice(0, 7);
  return [...grup.entries()].map(([kunci, data]) => ({
    kunci,
    label: dariKunci(`${kunci}-01`).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    }),
    singkat: dariKunci(`${kunci}-01`).toLocaleDateString("id-ID", { month: "short" }),
    ...jumlahkan(data),
    berjalan: kunci === bulanIni,
  }));
}

export function bandingkanBulan(harian: HariPenjualan[]) {
  const terakhir = harian[harian.length - 1];
  if (!terakhir) return null;

  const hariIni = dariKunci(terakhir.tanggal);
  const n = hariIni.getDate();
  const awalBulanLalu = new Date(hariIni.getFullYear(), hariIni.getMonth() - 1, 1);
  const prefiksIni = terakhir.tanggal.slice(0, 7);
  const prefiksLalu = kunciTanggal(awalBulanLalu).slice(0, 7);
  const sampaiN = (h: HariPenjualan, prefiks: string) =>
    h.tanggal.startsWith(prefiks) && dariKunci(h.tanggal).getDate() <= n;
  const namaBulan = (d: Date) =>
    d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return {
    sekarang: jumlahkan(harian.filter((h) => sampaiN(h, prefiksIni))),
    sebelum: jumlahkan(harian.filter((h) => sampaiN(h, prefiksLalu))),
    labelSekarang: `1 sampai ${n} ${namaBulan(hariIni)}`,
    labelSebelum: `1 sampai ${n} ${namaBulan(awalBulanLalu)}`,
  };
}