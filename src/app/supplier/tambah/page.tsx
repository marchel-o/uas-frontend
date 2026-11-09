import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SupplierForm from "../../components/supplier/SupplierForm";

export default function TambahSupplierPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link
          href="/supplier"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar supplier
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          Tambah supplier
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Isi data supplier baru. Kolom bertanda * wajib diisi.
        </p>
      </div>

      <SupplierForm />
    </main>
  );
}