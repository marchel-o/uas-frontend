import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StoreForm from "@/app/components/store/StoreForm";

export const dynamic = "force-dynamic";

export default async function InformasiTokoPage() {
  const setting = await prisma.storeSetting.findUnique({ where: { id: 1 } });

  return (
    <>
      <div>
        <Link
          href="/main/settings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke pengaturan
        </Link>

        <h1 className="mt-3 font-bold text-2xl">Informasi Toko</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Data ini menjadi identitas toko Anda. Kolom bertanda * wajib diisi.
        </p>
      </div>

      <StoreForm
        initial={{
          name: setting?.name ?? "",
          address: setting?.address ?? "",
          phone: setting?.phone ?? "",
          email: setting?.email ?? "",
          receiptNote: setting?.receiptNote ?? "",
        }}
      />
    </>
  );
}