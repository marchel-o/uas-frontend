import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SupplierForm from "../../../components/supplier/SupplierForm";

export default function TambahSupplierPage() {
  return (
    <>
      <div>
        <Link
          href="/main/supplier"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar supplier
        </Link>

        <h1 className="mt-3 font-bold text-2xl">Tambah Supplier</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Isi data supplier baru. Kolom bertanda * wajib diisi.
        </p>
      </div>

      <SupplierForm />
    </>
  );
}