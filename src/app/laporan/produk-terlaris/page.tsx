import type { Metadata } from "next";
import { ProdukView } from "@/features/laporan/ProdukView";

export const metadata: Metadata = { title: "Produk Terlaris | Laporan" };

export default function Page() {
  return <ProdukView />;
}