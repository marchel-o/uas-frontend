import Link from "next/link";
import { Plus } from "lucide-react";
import SupplierTable, { type Supplier } from "../components/supplier/SupplierTable";

const suppliers: Supplier[] = [];

export default function SupplierPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Daftar supplier
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pemasok barang untuk minimarket Anda.
          </p>
        </div>
        {suppliers.length > 0 && (
          <Link
            href="/supplier/tambah"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Tambah supplier
          </Link>
        )}
      </header>

      <SupplierTable data={suppliers} />
    </main>
  );
}