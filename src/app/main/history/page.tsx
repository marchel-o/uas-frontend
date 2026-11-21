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
        <div>
            <div>
                <h1>Riwayat Transaksi</h1>
            </div>

            <div>
                <div>
                    <h2>Daftar Transaksi</h2>
                    <span>Total {transactions.length} transaksi</span>
                </div>

                {loading ? (
                    <p>Memuat riwayat transaksi...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : transactions.length === 0 ? (
                    <p>Belum ada transaksi</p>
                ) : (
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Tanggal</th>
                                    <th>Kasir</th>
                                    <th>Produk</th>
                                    <th>Metode</th>
                                    <th>Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.invoice}</td>
                                        <td>{new Date(transaction.createdAt).toLocaleString("id-ID")}</td>
                                        <td>{transaction.user?.name}</td>
                                        <td>{transaction.items.map((item, index) => (
                                            <p key={index}>{item.product.name} x {item.quantity}</p>
                                            )
                                            )}
                                        </td>

                                        <td>{transaction.payment?.method}</td>
                                        <td>{formatRp(transaction.total)}</td>
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