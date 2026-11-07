import type { Metadata } from "next";
import { BulananView } from "@/app/features/laporan/BulananView";

export const metadata: Metadata = { title: "Laporan Penjualan Bulanan | Laporan" };

export default function Page() {
  return <BulananView />;
}