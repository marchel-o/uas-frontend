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
    category: {name:string};
};

export default function PaymentPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [amountPaid, setAmountPaid] = useState("");
    const [method, setMethod] = useState("cash");

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");

        if(savedCart) {
            setCart((JSON.parse(savedCart)));
        }
    }, []);

    const formatRp = (price: number | string) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(price));

    const total = cart.reduce((sum, item) =>
    sum + Number(item.price) * item.quantity, 0);

    const change = Number(amountPaid) - total;
    const paymentValid = cart.length > 0 && amountPaid !== "" && Number(amountPaid) >= total;

    const handlePayment = async () => {
        try {
            const response = await fetch("/api/transactions", {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    userId: 1,
                    items: cart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                    method, amountPaid: Number(amountPaid),
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Transaksi gagal");
            }

            localStorage.removeItem("cart");
            localStorage.setItem("lastTransaction", JSON.stringify(result.data)
            );

            window.location.href = "/main/success";
        } catch (error) {
            alert(
                error instanceof Error ? error.message: "Terjadi kesalahan"
            );
        }
    };

    return(
        <div className="min-h-screen p-5">
            <div className="mb-8">
                <h1 className="text-2xl font-bold uppercase">
                    Pembayaran
                </h1>
                <p className="text-sm text-red-500 mt-2">
                    Selesaikan Transaksi
                </p>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold mb-4">
                        Detail Belanja
                    </h2>

                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between border-b border-gray-400 py-3">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.quantity} x {formatRp(item.price)}</p>
                            </div>

                            <p className="font-semibold">{formatRp(Number(item.price) * item.quantity)}</p>
                        </div>
                    ))}

                    <div className="flex justify-between mt-4">
                        <h3 className="font-semibold">Total Belanja</h3>
                        <p className="font-bold text-red-600">{formatRp(total)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl mt-5 p-6 shadow-sm border border-gray-400">
                    <h2 className="font-bold uppercase mb-4">Detail Pembayaran</h2>

                    <label className="block text-sm font-medium text-gray-500 mb-1">Metode Pembayaran</label>

                    <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border rounded-lg text-sm p-1 text-center mb-5">
                        <option value="cash">Cash</option>
                        <option value="debit">Debit</option>
                        <option value="Transfer">Transfer</option>
                    </select>

                    <label className="block font-semibold mb-1">Total Dibayar:</label>

                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="Masukkan nominal" className="w-full border rounded-lg p-1 mb-4"/>

                    <div className="flex justify-between">
                        <span>Kembalian: </span>

                        <span className="text-red-700 font-semibold">{formatRp(Math.max(change, 0))}</span>

                    </div>

                    {amountPaid !== "" && Number(amountPaid) < total && (
                        <p className="text-red-600 mt-1">
                            Uang yang dibayar masih kurang!
                        </p>
                    )}

                    <button onClick={handlePayment} disabled={!paymentValid} className="w-full bg-red-700 text-white rounded-xl p-4 font-bold hover:bg-red-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Proses pembayaran
                    </button>

                    <Link href="/main/cart" className="block text-center text-sm border bg-red-700 rounded-xl p-2 mt-2 text-gray-200 hover:bg-red-800">Kembali ke keranjang</Link>
                </div>
            </div>
        </div>
    );
}