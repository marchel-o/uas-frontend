"use client";

import { useEffect, useState } from "react";

type Product = {
    id: number;
    name: string;
    sku: string;
    price: number | string;
    stock: number;
    category: { name:string }; 
};

export default function TransactionsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/api/products");
                const result = await response.json();

                if(!response.ok || !result.success) {
                    throw new Error("Gagal mengambil data produk");
                }
                setProducts(result.data);
            } catch (error) {
                setError(
                    error instanceof Error ? error.message : "terjadi kesalahan"
                );
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const formatRp = (price: number | string) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(price));

    return (
        <div className="min-h-screen p-5">
            <div className="mb-8">
                <h1 className="text-2xl font-bold ">
                    Halaman Transaksi Kasir
                </h1>

                <p className="text-sm mt-2 text-gray-500">
                    Pilih produk untuk memulai transaksi
                </p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Daftar Produk
                        </h2>

                        <span className="text-sm text-gray-500">
                            {products.length} Produk
                        </span>
                    </div>
                </div>
            

            {loading ? (
                <p>Memuat Produk...</p>
            ): error ? (
                <p>{error}</p>
            ): products.length === 0 ? (
                <p>Belum ada produk tersedia</p>
            ): (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className=" bg-gray-100 border border-gray-300 rounded-lg p-4 hover:border-red-700 hover:shadow-md transition">
                            <h2 className="font-semibold">
                                {product.name}
                            </h2>

                            <p className="font-bold text-red-700">
                                Harga: {formatRp(product.price)}
                            </p>

                            <p className="text-xs mt-3 mb-0">
                                SKU: {product.sku}
                            </p>

                            <p className="mt-0 text-xs">
                                Kategori: {product.category.name}
                            </p>

                            <p className="text-xs font-bold">
                                Stok: {product.stock}
                            </p>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}