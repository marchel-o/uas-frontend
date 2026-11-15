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

type CartItem = Product & {quantity: number;};

export default function TransactionsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);

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

    const addToCart = (product: Product) => {
        if(product.stock <= 0) {
            return;
        }

        setCart((prevCart) => {
            const existingProduct = prevCart.find(
                (item) => item.id === product.id
            );

            if(existingProduct) {
                if(existingProduct.quantity >= product.stock) {
                    return prevCart;
                }

                return prevCart.map((item) =>
                    item.id === product.id ? {...item, quantity: item.quantity + 1} : item
                );
            }

            return [...prevCart, {...product, quantity: 1}];
        });
    };

    const updateQuantity = (id: number, amount: number) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if(item.id === id) {
                    const newQuantity = item.quantity + amount;

                    if(newQuantity > item.stock) {
                        return item;
                    }
                    return {...item, quantity: newQuantity};
                }
                return item;
            }).filter((item) => item.quantity > 0)
        );
    };

    const total = cart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
    );

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
                        <div key={product.id} onClick={() => addToCart(product)} className=" bg-gray-100 border border-gray-300 rounded-lg p-4 hover:border-red-700 hover:shadow-md transition cursor-pointer hover:bg-gray-200">
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

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mt-5">
                <h2 className="font-bold text-lg mb-4">
                    Keranjang Transaksi
                </h2>

                {cart.length === 0 ? (
                    <p className="text-sm">
                        Belum ada produk yang dipilih
                    </p>
                ) : (
                    <div>
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between border-b py-3">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatRp(item.price)} x {item.quantity}      
                                    </p>
                                </div>
                                
                                <p className="font-semibold">
                                    {formatRp(Number(item.price) * item.quantity)}
                                </p>

                                <div>
                                    <button onClick={() => updateQuantity(item.id, -1)} className="border rounded px-1 m-2">-</button>

                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="border rounded px-1 m-2">+</button>
                                </div>
                            </div>
                            ))}
                            
                            <div className="flex justify-between mt-5">
                                <h3 className="font-bold">Total: </h3>

                                <p className="font-bold text-red-600">{formatRp(total)}</p>
                            </div>
                    </div>
                )}
            </div>
        </div>
    );
}