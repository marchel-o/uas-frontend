import type { Metadata } from "next";
import { MingguanView } from "@/features/laporan/MingguanView";

export const metadata: Metadata = { title: "Laporan Penjualan Mingguan | Laporan" };

export default function Page() {
  return <MingguanView />;
}