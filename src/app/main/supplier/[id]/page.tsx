import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplierId = Number(id);

  if (!Number.isInteger(supplierId) || supplierId < 1) notFound();

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) notFound();

  const info = [
    { label: "Nama kontak", value: supplier.contactName },
    { label: "Telepon", value: supplier.phone },
    { label: "Email", value: supplier.email },
    { label: "Alamat", value: supplier.address },
    {
      label: "Terdaftar sejak",
      value: supplier.createdAt.toLocaleDateString("id-ID", { dateStyle: "long" }),
    },
  ];

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

        <h1 className="mt-3 font-bold text-2xl">{supplier.name}</h1>
        <p className="text-[var(--text-secondary)] text-sm">Detail supplier</p>
      </div>

      <dl className="space-y-4 rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        {info.map(({ label, value }) => (
          <div key={label} className="grid gap-1 sm:grid-cols-3">
            <dt className="text-sm font-medium text-[var(--text-secondary)]">{label}</dt>
            <dd className="text-sm sm:col-span-2">{value || "-"}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}