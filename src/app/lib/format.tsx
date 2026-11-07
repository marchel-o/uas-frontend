const rupiahFmt = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});
const angkaFmt = new Intl.NumberFormat("id-ID");
const ringkasFmt = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const rupiah = (n: number) => rupiahFmt.format(n);
export const angka = (n: number) => angkaFmt.format(n);
export const ringkas = (n: number) => ringkasFmt.format(n);

export const persen = (n: number) =>
  `${n >= 0 ? "+" : "-"}${Math.abs(n).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;

export const tanggalHari = (d: Date) =>
  d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });

export const tanggalPendek = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });