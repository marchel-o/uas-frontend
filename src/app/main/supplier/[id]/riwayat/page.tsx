import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RiwayatPembelianPage({
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

  // Stok masuk yang terhubung lewat supplierId, atau lewat nama (data yang lama teks)
  const riwayat = await prisma.stockMovement.findMany({
    where: {
      type: "masuk",
      OR: [
        { supplierId: supplier.id },
        { supplier: { equals: supplier.name, mode: "insensitive" } },
      ],
    },
    include: { product: true },
    orderBy: { movedAt: "desc" },
  });

  const totalUnit = riwayat.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <>
      <div>
        <Link
          href={`/main/supplier/${supplier.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke detail supplier
        </Link>

        <h1 className="mt-3 font-bold text-2xl">Riwayat Pembelian</h1>
        <p className="text-[var(--text-secondary)] text-sm">{supplier.name}</p>
      </div>

      {riwayat.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-[var(--surface)] shadow-lg px-6 py-16 text-center">
          <PackageOpen className="mb-4 h-10 w-10 text-gray-400" aria-hidden />
          <h2 className="text-lg font-semibold">Belum ada pembelian</h2>
          <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
            Stok masuk dari supplier ini akan muncul di sini setelah dicatat.
          </p>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl p-4 bg-[var(--surface)] shadow-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm text-[var(--text-secondary)]">Jumlah pembelian</p>
              <p className="text-2xl font-bold">{riwayat.length}</p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm text-[var(--text-secondary)]">Total barang masuk</p>
              <p className="text-2xl font-bold">{totalUnit}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="text-left text-[var(--text-secondary)]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Tanggal</th>
                  <th scope="col" className="px-4 py-3 font-medium">Produk</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Jumlah</th>
                  <th scope="col" className="px-4 py-3 font-medium">Referensi</th>
                  <th scope="col" className="px-4 py-3 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riwayat.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.movedAt.toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3 font-medium">{r.product.name}</td>
                    <td className="px-4 py-3 text-right">{r.quantity}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {r.reference || "-"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {r.note || r.reason || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}