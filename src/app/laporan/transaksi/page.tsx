import type { Metadata } from "next";
import { TransaksiView } from "@/app/features/laporan/TransaksiView";

export const metadata: Metadata = { title: "Riwayat Transaksi | Laporan" };

export default function Page() {
  return <TransaksiView />;
}