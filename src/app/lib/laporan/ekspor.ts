import {
  DATA_CONTOH,
  type HariPenjualan,
  type ProdukTerlaris,
  type Total,
  type Transaksi,
} from "./data";
import { angka, rupiah } from "../format";

export type Rekap = {
  dari: string;
  sampai: string;
  total: Total;
  harian: HariPenjualan[];
  produk: ProdukTerlaris[]; 
  transaksi: Transaksi[];
};

const CATATAN = "Data contoh, bukan data transaksi asli.";

const namaFile = (r: Rekap, ekstensi: string) =>
  `laporan-penjualan_${r.dari}_${r.sampai}.${ekstensi}`;

export async function unduhExcel(r: Rekap) {
  const XLSX = await import("xlsx");

  const ringkasan: (string | number)[][] = [
    ["Laporan penjualan"],
    ["Periode", `${r.dari} sampai ${r.sampai}`],
    ["Total pendapatan (Rp)", r.total.pendapatan],
    ["Jumlah transaksi", r.total.transaksi],
    ["Produk terjual", r.total.produkTerjual],
    ...(DATA_CONTOH ? [[CATATAN]] : []),
  ];
  const transaksi: (string | number)[][] = [
    ["ID transaksi", "Tanggal", "Jam", "Item", "Jumlah produk", "Total (Rp)"],
    ...r.transaksi.map((t) => [
      t.id,
      t.tanggal,
      t.jam,
      t.item.map((i) => `${i.produk} x${i.jumlah}`).join(", "),
      t.jumlahProduk,
      t.total,
    ]),
  ];
  const produk: (string | number)[][] = [
    ["Peringkat", "Produk", "Terjual", "Pendapatan (Rp)"],
    ...r.produk.map((p, i) => [i + 1, p.nama, p.terjual, p.pendapatan]),
  ];

  const buku = XLSX.utils.book_new();
  const tambah = (nama: string, baris: (string | number)[][], lebar: number[]) => {
    const lembar = XLSX.utils.aoa_to_sheet(baris);
    lembar["!cols"] = lebar.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(buku, lembar, nama);
  };

  tambah("Ringkasan", ringkasan, [24, 28]);
  tambah("Transaksi", transaksi, [14, 12, 8, 48, 14, 14]);
  tambah("Produk terlaris", produk, [10, 20, 10, 18]);
  XLSX.writeFile(buku, namaFile(r, "xlsx"));
}

export async function unduhPdf(r: Rekap) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const rp = (n: number) => rupiah(n).replace(/\u00a0/g, " ");
  const kepala: { fillColor: [number, number, number] } = { fillColor: [128, 0, 0] };
  const akhirTabel = () =>
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFontSize(16);
  doc.text("Laporan penjualan", 14, 18);
  doc.setFontSize(10);
  doc.text(`Periode: ${r.dari} sampai ${r.sampai}`, 14, 26);
  doc.text(`Total pendapatan: ${rp(r.total.pendapatan)}`, 14, 32);
  doc.text(
    `Jumlah transaksi: ${angka(r.total.transaksi)}    Produk terjual: ${angka(r.total.produkTerjual)}`,
    14,
    38,
  );

  let y = 44;
  if (DATA_CONTOH) {
    doc.text(CATATAN, 14, y);
    y += 6;
  }

  doc.text("Produk terlaris", 14, y + 6);
  autoTable(doc, {
    startY: y + 9,
    head: [["Peringkat", "Produk", "Terjual", "Pendapatan"]],
    body: r.produk.map((p, i) => [i + 1, p.nama, angka(p.terjual), rp(p.pendapatan)]),
    headStyles: kepala,
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
  });

  const yRekap = akhirTabel() + 10;
  doc.text("Rekap per hari", 14, yRekap);
  autoTable(doc, {
    startY: yRekap + 3,
    head: [["Tanggal", "Transaksi", "Produk terjual", "Pendapatan"]],
    body: r.harian.map((h) => [
      h.tanggal,
      angka(h.transaksi),
      angka(h.produkTerjual),
      rp(h.pendapatan),
    ]),
    headStyles: kepala,
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });

  doc.save(namaFile(r, "pdf"));
}