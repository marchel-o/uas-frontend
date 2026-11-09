"use client";

import { useEffect, useState } from "react";

type Product = {
    id: number;
    name: String;
    sku: String;
    price: number | string;
    stock: number;
    category: { name:string }; 
};

export default function TransactionsPage() {
    const [Products, setProducts] = useState<Product[]>([]);
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
        <div>
            <h1>
                Halaman Transaksi Kasir
            </h1>

            <p>
                Pilih produk untuk memulai transaksi
            </p>

            {loading ? (
                <p>Memuat Produk...</p>
            ): error ? (
                <p>{error}</p>
            ): Products.length === 0 ? (
                <p>Belum ada produk tersedia</p>
            ): (
                <div>
                    {Products.map((product) => (
                        <div key={product.id}>
                            <h2>
                                {product.name}
                            </h2>

                            <p>
                                Harga: {formatRp(product.price)}
                            </p>

                            <p>
                                SKU: {product.sku}
                            </p>

                            <p>
                                Kategori: {product.category.name}
                            </p>

                            <p>
                                Stok: {product.stock}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}