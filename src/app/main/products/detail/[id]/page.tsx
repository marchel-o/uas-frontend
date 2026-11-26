'use client'

import { ArrowLeft, Box, Edit, RotateCcw, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

type Product = {
    id: number
    name: string
    sku: string
    buyPrice: number | string | null
    price: number | string
    stock: number
    image: string | null
    isActive: boolean
    category: { id: number; name: string }
}

export default function ProductDetail() {
    const router = useRouter()
    const params = useParams<{ id: string }>()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [deletePopup, setDeletePopup] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    const [restoring, setRestoring] = useState(false)
    const [restoreError, setRestoreError] = useState("")
    const [imageFailed, setImageFailed] = useState(false)

    useEffect(() => {
        let ignore = false

        async function fetchProduct() {
            try {
                const response = await fetch(`/api/products/${params.id}`)
                const result = await response.json()

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Gagal mengambil data produk")
                }

                if (!ignore) {
                    setProduct(result.data)
                    setImageFailed(false)
                }
            } catch (error) {
                if (!ignore) setError(error instanceof Error ? error.message : "Terjadi kesalahan")
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchProduct()

        return () => {
            ignore = true
        }
    }, [params.id])

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);
    };

    const handleRestore = async () => {
        if (!product) return

        setRestoreError("")

        try {
            setRestoring(true)

            const response = await fetch(`/api/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true }),
            })
            const result = await response.json()

            if (!response.ok || !result.success) {
                setRestoreError(result.message || "Gagal memulihkan produk")
                return
            }

            setProduct(result.data)
        } catch {
            setRestoreError("Gagal terhubung ke server")
        } finally {
            setRestoring(false)
        }
    }

    const closeDelete = () => {
        setDeletePopup(false)
        setDeleteError("")
    }

    const handleDelete = async () => {
        if (!product) return

        setDeleteError("")

        try {
            setDeleting(true)

            const response = await fetch(`/api/products/${product.id}`, {
                method: "DELETE",
            })
            const result = await response.json()

            if (!response.ok || !result.success) {
                setDeleteError(result.message || "Gagal menghapus produk")
                return
            }

            router.push("/main/products")
        } catch {
            setDeleteError("Gagal terhubung ke server")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <Link href="/main/products" className="p-2 bg-[var(--surface)] rounded-lg shadow cursor-pointer">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="font-bold text-2xl">
                    Detail Produk
                </h1>
            </div>

            {loading ? (
                <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                    <p className="text-[var(--text-secondary)] text-sm">Memuat detail produk...</p>
                </div>
            ) : !product ? (
                <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                    <p className="text-red-500 text-sm">{error}</p>
                    <Link
                        href="/main/products"
                        className="inline-block p-2 px-3 mt-3 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-all"
                    >
                        Kembali ke Daftar Produk
                    </Link>
                </div>
            ) : (
                <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                    <div className="md:flex items-center">
                        {product.image && !imageFailed ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                onError={() => setImageFailed(true)}
                                className="w-24 h-24 object-cover rounded-xl m-auto md:m-0 shrink-0"
                            />
                        ) : (
                            <div className="p-5 bg-red-50 text-[var(--primary)] rounded-xl w-fit m-auto md:m-0">
                                <Box size={36} />
                            </div>
                        )}

                        <div className="text-center md:text-left md:ml-4 mt-3 md:mt-0">
                            <p className="font-semibold text-lg">{product.name}</p>
                            <p className="text-[var(--text-secondary)] text-[0.8rem]">{product.sku} • {product.category.name}</p>
                            <p className="text-[var(--primary)] text-base mt-1 font-semibold">{formatRupiah(Number(product.price))}</p>
                            <p className={`inline-block p-0.5 px-2 mt-1 text-[.7em] rounded font-[550] ${product.isActive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                                {product.isActive ? "Aktif" : "Nonaktif"}
                            </p>
                        </div>

                        <div className="flex justify-center gap-2 mt-4 md:mt-0 md:ml-auto">
                            {product.isActive ? (
                                <>
                                    <Link
                                        href={`/main/products/edit/${product.id}`}
                                        className="flex items-center gap-1.5 p-2 px-3 bg-[var(--primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--primary-hover)] transition-all"
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setDeletePopup(true)}
                                        className="flex items-center gap-1.5 p-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm cursor-pointer hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                        <span>Hapus</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    disabled={restoring}
                                    onClick={handleRestore}
                                    className="flex items-center gap-1.5 p-2 px-3 bg-[var(--primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all"
                                >
                                    <RotateCcw size={16} />
                                    <span>{restoring ? "Memulihkan..." : "Aktifkan Kembali"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {restoreError && <p className="text-red-500 text-sm text-center md:text-right mt-2">{restoreError}</p>}

                    <div className="w-full h-[.06rem] bg-gray-800 opacity-15 my-6"></div>

                    <h3 className="font-bold text-[1.05rem] mt-4">Informasi Barang</h3>

                    <p className="text-[var(--text-secondary)] text-sm mt-2">Kode Barcode (SKU)</p>
                    <p className="font-semibold">{product.sku}</p>

                    <p className="text-[var(--text-secondary)] text-sm mt-2">Kategori</p>
                    <p className="font-semibold">{product.category.name}</p>

                    <p className="text-[var(--text-secondary)] text-sm mt-2">Harga Beli (Modal)</p>
                    <p className="font-semibold">{product.buyPrice == null ? "—" : formatRupiah(Number(product.buyPrice))}</p>

                    <p className="text-[var(--text-secondary)] text-sm mt-2">Harga Jual Kasir</p>
                    <p className="font-semibold">{formatRupiah(Number(product.price))}</p>

                    <div className="w-full h-[.06rem] bg-gray-800 opacity-15 my-6"></div>

                    <h3 className="font-bold text-[1.05rem]">Penyimpanan & Stok</h3>

                    <p className="text-[var(--text-secondary)] text-sm mt-2">Stok Tersedia</p>
                    <p className="font-semibold">{product.stock} pcs</p>

                    {!product.isActive && (
                        <p className="text-[var(--text-secondary)] text-sm mt-1">Stok 0, perbarui stok lewat Edit</p>
                    )}
                </div>
            )}

            {deletePopup && product && (
                <>
                    <div
                        className="w-full h-full fixed inset-0 z-9 bg-black transition-all opacity-50 duration-200"
                        onClick={closeDelete}
                    ></div>

                    <div className="fixed bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 min-w-62.5 max-w-sm rounded-lg">
                        <h3 className="text-red-500 text-xl text-center font-semibold">Hapus Produk</h3>

                        <p className="text-center mt-3 text-[var(--text-secondary)]">
                            Yakin ingin menghapus produk <span className="font-semibold">{product.name}</span>?
                        </p>

                        {deleteError && <p className="text-red-500 text-sm text-center mt-2">{deleteError}</p>}

                        <div className="text-blue-500 font-medium flex gap-4 mt-4">
                            <button
                                className="text-center p-2 w-full rounded-lg cursor-pointer"
                                onClick={closeDelete}
                            >
                                Tidak
                            </button>

                            <button
                                className="text-center p-2 w-full rounded-lg cursor-pointer disabled:opacity-50"
                                disabled={deleting}
                                onClick={handleDelete}
                            >
                                {deleting ? "Menghapus..." : "Ya"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
