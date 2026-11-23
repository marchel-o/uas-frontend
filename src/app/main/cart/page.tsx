
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
    id: number;
    name: string;
    sku: string;
    price: number | string;
    stock: number;
    quantity: number;
    category: { name: string };
};

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");

        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const formatRp = (price: number | string) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(price));


    const updateQuantity = (id: number, amount: number) => {
        setCart((prevCart) => {
            const updatedCart = prevCart
                .map((item) => {
                    if (item.id === id) {
                        const newQuantity = item.quantity + amount;
                        if (newQuantity > item.stock) {
                            return item;
                        }
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                }).filter((item) => item.quantity > 0);

            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return (
        <div className="min-h-screen p-5">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    Keranjang Belanja
                </h1>

                <p className="text-sm mt-2 text-gray-500">
                    Periksa produk sebelum melanjutkan pembayaran
                </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold">
                        Daftar Keranjang
                    </h2>

                    <span className="text-sm text-gray-500">
                        {cart.length} Produk
                    </span>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">
                            Keranjang masih kosong
                        </p>

                        <Link href="/main/transactions" className="inline-block bg-red-700 text-white rounded-lg px-5 py-2 hover:bg-red-800">
                            Pilih Produk
                        </Link>
                    </div>
                ) : (
                    <div>
                        {cart.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 py-4">
                                <div>
                                    <h3 className="font-semibold">
                                        {item.name}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        SKU: {item.sku}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {formatRp(item.price)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="border rounded-lg px-3 py-1 hover:bg-gray-100">
                                        -
                                    </button>

                                    <span className="font-semibold">
                                        {item.quantity}
                                    </span>

                                    <button onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.stock} className="border rounded-lg px-3 py-1 hover:bg-gray-100 disabled:opacity-40">
                                        +
                                    </button>
                                </div>

                                <p className="font-semibold text-red-700">
                                    {formatRp(Number(item.price) * item.quantity)}
                                </p>
                            </div>
                        ))}

                        <div className="flex justify-between items-center border-t pt-5 mt-5">
                            <h2 className="font-bold text-lg">
                                Total Belanja
                            </h2>

                            <p className="font-bold text-lg text-red-700">
                                {formatRp(total)}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                            <Link
                                href="/main/transactions"
                                className="text-center border rounded-lg px-5 py-3 hover:bg-gray-100"
                            >
                                Tambah Produk
                            </Link>

                            <Link
                                href="/main/payment"
                                className="text-center bg-red-700 text-white rounded-lg px-5 py-3 hover:bg-red-800 transition"
                            >
                                Lanjut Pembayaran
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
