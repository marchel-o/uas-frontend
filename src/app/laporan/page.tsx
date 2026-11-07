import type { Metadata } from "next";
import { RingkasanView } from "@/app/features/laporan/RingkasanView";

export const metadata: Metadata = { title: "Ringkasan Penjualan | Laporan" };

export default function Page() {
  return <RingkasanView />;
}