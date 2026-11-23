"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Transaction = {
    invoice: string;
    total: number | string;
    createdAt: string;
    user: {
        name: string;
    };
    items: {
        quantity: number;
        price: number | string;
        subtotal: number | string;
        product: {
            name: string;
        };
    }[];
    payment: {
        method: string;
        amountPaid: number | string;
        change: number | string;
    };
};

export default function SuccessPage() {
    const [transaction, setTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        const savedTransaction = localStorage.getItem("lastTransaction");

        if (savedTransaction) {
            setTransaction(JSON.parse(savedTransaction));
        }
    }, []);

    const formatRp = (price: number | string) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", maximumFractionDigits: 0,
        }).format(Number(price));

    if (!transaction) {
        return (
            <div>
                <p>Transaksi tidak ditemukan</p>

                <Link href="/main/transactions">
                    Kembali ke Halaman
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-5 flex justify-center">
            <div className="bg-white border rounded-xl p-7 w-full max-w-lg h-fit">
                <div className="text-center mb-2">
                    <div className="font-bold text-4xl">
                        ✓
                    </div>

                    <h1 className="font-bold text-2xl">
                        Transaksi Berhasil
                    </h1>

                    <p className="text-sm mt-1 border-b border-gray-500 pb-4">
                        Pembayaran telah berhasil diproses
                    </p>
                </div>

                <div className="border-b border-gray-500 py-3 text-sm space-y-2">
                    <div className="text-gray-500">
                        <span>Invoice: </span>
                        <span>{transaction.invoice}</span>
                    </div>

                    <div className="text-gray-500">
                        <span>Tanggal: </span>
                        <span>
                            {new Date(transaction.createdAt).toLocaleString("id-ID")}
                        </span>
                    </div>

                    <div className="text-gray-500">
                        <span>Kasir: </span>
                        <span>{transaction.user?.name}</span>
                    </div>
                </div>

                <div className="py-4">
                    <h2 className="text-center font-bold mb-2">
                        Detail Produk
                    </h2>

                    {transaction.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm mb-3">
                            <div>
                                <p>{item.product.name}</p>
                                <p>{item.quantity} x {formatRp(item.price)}</p>
                            </div>

                            <p className="font-semibold">
                                {formatRp(item.subtotal)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatRp(transaction.total)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Metode Pembayaran</span>
                        <span>{transaction.payment.method}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Uang Diterima</span>
                        <span>{formatRp(transaction.payment.amountPaid)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Kembalian</span>
                        <span>{formatRp(transaction.payment.change)}</span>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button onClick={() => window.print()} className="w-full border bg-red-700 rounded-xl p-3 text-white hover:bg-red-800">
                        Cetak Struk
                    </button>

                    <Link href="/main/transactions" className=" block text-center w-full text-sm border bg-red-700 rounded-xl p-2 text-white hover:bg-red-800">
                        Transaksi Baru
                    </Link>
                </div>
            </div>
        </div>
    );
}
