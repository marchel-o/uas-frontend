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
        <div>
            <div>
                <div>
                    <div>
                        ✓
                    </div>

                    <h1>
                        Transaksi Berhasil
                    </h1>

                    <p>
                        Pembayaran telah berhasil diproses
                    </p>
                </div>

                <div>
                    <div>
                        <span>Invoice</span>
                        <span>{transaction.invoice}</span>
                    </div>

                    <div>
                        <span>Tanggal</span>
                        <span>
                            {new Date(transaction.createdAt).toLocaleString("id-ID")}
                        </span>
                    </div>

                    <div>
                        <span>Kasir: </span>
                        <span>{transaction.user?.name}</span>
                    </div>
                </div>

                <div>
                    <h2>
                        Detail Produk
                    </h2>

                    {transaction.items.map((item, index) => (
                        <div key={index}>
                            <div>
                                <p>{item.product.name}</p>
                                <p>{item.quantity} x {formatRp(item.price)}</p>
                            </div>

                            <p>
                                {formatRp(item.subtotal)}
                            </p>
                        </div>
                    ))}
                </div>

                <div>
                    <div>
                        <span>Total</span>
                        <span>{formatRp(transaction.total)}</span>
                    </div>

                    <div>
                        <span>Metode Pembayaran: </span>
                        <span>{transaction.payment.method}</span>
                    </div>

                    <div>
                        <span>Uang Diterima</span>
                        <span>{formatRp(transaction.payment.amountPaid)}</span>
                    </div>

                    <div>
                        <span>Kembalian</span>
                        <span>{formatRp(transaction.payment.change)}</span>
                    </div>
                </div>

                <div>
                    <button onClick={() => window.print()}>
                        Cetak Struk
                    </button>

                    <Link href="/main/transactions">
                        Transaksi Baru
                    </Link>
                </div>
            </div>
        </div>
    );
}
