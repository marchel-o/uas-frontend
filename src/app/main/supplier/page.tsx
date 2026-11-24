import Link from "next/link";
import { Plus } from "lucide-react";
import SupplierTable, { type Supplier } from "../../components/supplier/SupplierTable";

const suppliers: Supplier[] = [];

export default function SupplierPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">Daftar Supplier</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Pemasok barang untuk toko Anda.
          </p>
        </div>

        {suppliers.length > 0 && (
          <Link
            href="/main/supplier/tambah"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-light)] hover:bg-[var(--primary-hover)] transition-all"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Tambah supplier
          </Link>
        )}
      </div>

      <SupplierTable data={suppliers} />
    </>
  );
}