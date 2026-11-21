"use client";

import { useState, useEffect } from "react";
type Transaction = {
    id: number;
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

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await fetch("/api/transactions")
                const result = await response.json();

                if(!response.ok || !result.success) {
                    throw new Error("Gagal mengambil riwayat transaksi")
                }
                setTransactions(result.data);
            } catch(error) {
                setError( error instanceof Error ? error.message : "Terjadi Kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchTransactions();
    }, []);

    const formatRp = (price: number | string) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(price));

    return(
        <div className="min-h-screen p-5">
            <div className="mb-8">
                <h1 className="font-bold text-2xl uppercase">Riwayat Transaksi</h1>
            </div>

            <div className="bg-white rounded-xl p-5 border shadow-xl border-gray-200">
                <div className="flex justify-between mb-5">
                    <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
                    <span className="text-sm text-gray-600">Total {transactions.length} transaksi</span>
                </div>

                {loading ? (
                    <p>Memuat riwayat transaksi...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : transactions.length === 0 ? (
                    <p>Belum ada transaksi</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="border-b border-gray-400">
                                    <th className="p-3">Invoice</th>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Kasir</th>
                                    <th className="p-3">Produk</th>
                                    <th className="p-3">Metode</th>
                                    <th className="p-3">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b hover:bg-gray-200 cursor-pointer">
                                        <td className="font-medium">{transaction.invoice}</td>
                                        <td className="p-3">{new Date(transaction.createdAt).toLocaleString("id-ID")}</td>
                                        <td className="">{transaction.user?.name}</td>
                                        <td>{transaction.items.map((item, index) => (
                                            <p key={index}>{item.product.name} x {item.quantity}</p>
                                            )
                                            )}
                                        </td>

                                        <td className="capitalize">{transaction.payment?.method}</td>
                                        <td className="font-semibold text-green-700">{formatRp(transaction.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}