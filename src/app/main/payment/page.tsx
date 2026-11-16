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

    return(
        <div>
            <div>
                <h1>
                    Pembayaran
                </h1>
                <p>
                    Selesaikan Transaksi
                </p>

                <div>
                    <h2>
                        Detail Pembelian
                    </h2>

                    {cart.map((item) => (
                        <div key={item.id}>
                            <div>
                                <p>{item.name}</p>
                                <p>{item.quantity} x {formatRp(item.price)}</p>
                            </div>

                            <p>{formatRp(Number(item.price) * item.quantity)}</p>
                        </div>
                    ))}

                    <div>
                        <h3>Total Belanja</h3>
                        <p>{formatRp(total)}</p>
                    </div>
                </div>

                <div>
                    <h2>Detail Pembayaran</h2>

                    <label>Metode Pembayaran</label>

                    <select value={method} onChange={(e) => setMethod(e.target.value)}>
                        <option value="cash">Cash</option>
                        <option value="debit">Debit</option>
                        <option value="Transfer">Transfer</option>
                    </select>

                    <label>Total Dibayar:</label>

                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="Masukkan nominal"/>

                    <div>
                        <span>Kembalian</span>

                        <span>{formatRp(Math.max(change, 0))}</span>

                    </div>

                    {amountPaid !== "" && Number(amountPaid) < total && (
                        <p>
                            Uang yang dibayar masih kurang!
                        </p>
                    )}

                    <button disabled={!paymentValid}>
                        Proses pembayaran
                    </button>

                    <Link href="/main/cart">Kembali ke keranjang</Link>
                </div>
            </div>
        </div>
    );
}