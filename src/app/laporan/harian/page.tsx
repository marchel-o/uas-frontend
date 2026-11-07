import type { Metadata } from "next";
import { HarianView } from "@/app/features/laporan/HarianView";

export const metadata: Metadata = { title: "Laporan Penjualan Harian | Laporan" };

export default function Page() {
  return <HarianView />;
}