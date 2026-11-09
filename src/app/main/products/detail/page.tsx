'use client'

import { ArrowLeft, Box, Edit, Trash2 } from "lucide-react"

export default function ProductDetail() {
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <a href="/main/products" className="p-2 bg-[var(--surface)] rounded-lg shadow cursor-pointer">
                    <ArrowLeft size={20} />
                </a>
                <h1 className="font-bold text-2xl">
                    Detail Produk
                </h1>
            </div>

            <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                <div className="md:flex items-center">
                    <div className="p-5 bg-red-50 text-[var(--primary)] rounded-xl w-fit m-auto md:m-0">
                        <Box size={36} />
                    </div>

                    <div className="text-center md:text-left md:ml-4 mt-3 md:mt-0">
                        <p className="font-semibold text-lg">Indomie Goreng Spesial 85g</p>
                        <p className="text-[var(--text-secondary)] text-[0.8rem]">BRG-001 • Makanan Instan</p>
                        <p className="text-[var(--primary)] text-base mt-1 font-semibold">{formatRupiah(3100)}</p>
                    </div>

                    <div className="flex justify-center gap-2 mt-4 md:mt-0 md:ml-auto">
                        <button
                            type="button"
                            className="flex items-center gap-1.5 p-2 px-3 bg-[var(--primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--primary-hover)] transition-all"
                        >
                            <Edit size={16} />
                            <span>Edit</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 p-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm cursor-pointer hover:bg-red-100 transition-all"
                        >
                            <Trash2 size={16} />
                            <span>Hapus</span>
                        </button>
                    </div>
                </div>

                <div className="w-full h-[.06rem] bg-gray-800 opacity-15 my-6"></div>

                <h3 className="font-bold text-[1.05rem] mt-4">Informasi Barang</h3>

                <p className="text-[var(--text-secondary)] text-sm mt-2">Kode Barcode (SKU)</p>
                <p className="font-semibold">089686010947</p>

                <p className="text-[var(--text-secondary)] text-sm mt-2">Kategori</p>
                <p className="font-semibold">Makanan Instan</p>

                <p className="text-[var(--text-secondary)] text-sm mt-2">Harga Beli (Modal)</p>
                <p className="font-semibold">{formatRupiah(2750)}</p>

                <p className="text-[var(--text-secondary)] text-sm mt-2">Harga Jual Kasir</p>
                <p className="font-semibold">{formatRupiah(3100)}</p>

                <div className="w-full h-[.06rem] bg-gray-800 opacity-15 my-6"></div>

                <h3 className="font-bold text-[1.05rem]">Penyimpanan & Stok</h3>

                <p className="text-[var(--text-secondary)] text-sm mt-2">Stok Tersedia</p>
                <p className="font-semibold">140 pcs</p>

                <p className="text-[var(--text-secondary)] text-sm mt-2">Lokasi Rak</p>
                <p className="font-semibold">Rak A-02 (Lorong Makanan)</p>

                <p className="text-[var(--text-secondary)] text-sm mt-2">Supplier</p>
                <p className="font-semibold">PT Indofood CBP Sukses Makmur</p>
            </div>
        </>
    )
}