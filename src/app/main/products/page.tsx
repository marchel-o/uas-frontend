'use client'

import { Box, ChevronDown, Eye, Pencil, Plus, RotateCcw, Search, Tags, Trash2 } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { LOW_STOCK_THRESHOLD } from "@/lib/stock"

type Product = {
    id: number
    name: string
    sku: string
    price: number | string
    stock: number
    category: { id: number; name: string }
}

type Category = {
    id: number
    name: string
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [status, setStatus] = useState("active")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")
    const [actionError, setActionError] = useState("")
    const [restoringId, setRestoringId] = useState<number | null>(null)

    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)

        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories")
                const result = await response.json()

                if (response.ok && result.success) {
                    setCategories(result.data)
                }
            } catch {
                setCategories([])
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        let ignore = false

        async function fetchProducts() {
            try {
                setRefreshing(true)
                setError("")
                setActionError("")

                const params = new URLSearchParams()

                if (debouncedSearch) params.set("q", debouncedSearch)
                if (categoryId) params.set("categoryId", categoryId)
                if (status !== "active") params.set("status", status)

                const query = params.toString()
                const response = await fetch(`/api/products${query ? `?${query}` : ""}`)
                const result = await response.json()

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Gagal mengambil data produk")
                }

                if (!ignore) setProducts(result.data)
            } catch (error) {
                if (!ignore) setError(error instanceof Error ? error.message : "Terjadi kesalahan")
            } finally {
                if (!ignore) {
                    setLoading(false)
                    setRefreshing(false)
                }
            }
        }

        fetchProducts()

        return () => {
            ignore = true
        }
    }, [debouncedSearch, categoryId, status])

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num)
    }

    const stockClass = (stock: number) => {
        if (stock === 0) return "bg-red-50 text-red-600"
        if (stock <= LOW_STOCK_THRESHOLD) return "bg-orange-50 text-orange-600"
        return "bg-gray-100 text-[var(--text-secondary)]"
    }

    const isFiltering = debouncedSearch !== "" || categoryId !== ""

    const handleRestore = async (product: Product) => {
        setActionError("")

        try {
            setRestoringId(product.id)

            const response = await fetch(`/api/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true }),
            })
            const result = await response.json()

            if (!response.ok || !result.success) {
                setActionError(result.message || "Gagal memulihkan produk")
                return
            }

            setProducts((prev) => prev.filter((item) => item.id !== product.id))
        } catch {
            setActionError("Gagal terhubung ke server")
        } finally {
            setRestoringId(null)
        }
    }

    const closeDelete = () => {
        setDeleteTarget(null)
        setDeleteError("")
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        setDeleteError("")

        try {
            setDeleting(true)

            const response = await fetch(`/api/products/${deleteTarget.id}`, {
                method: "DELETE",
            })
            const result = await response.json()

            if (!response.ok || !result.success) {
                setDeleteError(result.message || "Gagal menghapus produk")
                return
            }

            setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id))
            closeDelete()
        } catch {
            setDeleteError("Gagal terhubung ke server")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-bold text-2xl">
                    Daftar Produk
                </h1>

                <div className="flex gap-2 ml-auto">
                    <Link
                        href="/main/products/categories"
                        className="flex items-center gap-1.5 p-2 px-3 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-all"
                    >
                        <Tags size={16} />
                        <span>Kategori</span>
                    </Link>
                    <Link
                        href="/main/products/add"
                        className="flex items-center gap-1.5 p-2 px-3 bg-[var(--primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--primary-hover)] transition-all"
                    >
                        <Plus size={16} />
                        <span>Tambah Produk</span>
                    </Link>
                </div>
            </div>

            <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none"
                            type="text"
                            placeholder="Cari nama atau SKU produk"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full sm:w-40">
                        <select
                            className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm outline-none cursor-pointer hover:bg-gray-50 transition-all"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>

                    <div className="relative w-full sm:w-52">
                        <select
                            className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm outline-none cursor-pointer hover:bg-gray-50 transition-all"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                <div className="flex items-center gap-2.5">
                    <div className="p-3 bg-red-50 rounded">
                        <Box size={20} className="text-[var(--primary)]" />
                    </div>
                    <div>
                        <p className="font-semibold text-[1.1rem]">Daftar Produk</p>
                        <p className="text-[var(--text-secondary)] text-[.8rem]">
                            {products.length} produk{refreshing && !loading ? " • memperbarui..." : ""}
                        </p>
                    </div>
                </div>

                {actionError && <p className="text-red-500 text-sm mt-4">{actionError}</p>}

                {loading ? (
                    <p className="text-[var(--text-secondary)] text-sm mt-4">Memuat produk...</p>
                ) : error ? (
                    <p className="text-red-500 text-sm mt-4">{error}</p>
                ) : products.length === 0 ? (
                    <p className="text-[var(--text-secondary)] text-sm mt-4">
                        {isFiltering
                            ? "Tidak ada produk yang cocok dengan pencarian atau filter"
                            : status === "inactive"
                                ? "Tidak ada produk nonaktif"
                                : "Belum ada produk"}
                    </p>
                ) : (
                    <div className="mt-3 flex flex-col gap-2">
                        {products.map((product, i) => (
                            <React.Fragment key={product.id}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mx-2">
                                    <div className="flex items-center gap-3 min-w-0 sm:flex-1">
                                        <div className="p-2.5 bg-red-50 text-[var(--primary)] rounded-xl shrink-0">
                                            <Box size={20} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold truncate">{product.name}</p>
                                            <p className="text-[var(--text-secondary)] text-sm truncate">
                                                {product.sku} • {product.category.name}
                                            </p>
                                            <p className="text-[var(--primary)] text-sm font-semibold mt-0.5">
                                                {formatRupiah(Number(product.price))}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                        <p className={`p-0.5 px-2 text-[.7em] rounded text-center font-[550] shrink-0 ${stockClass(product.stock)}`}>
                                            {product.stock} pcs
                                        </p>

                                        <div className="flex gap-1.5 shrink-0">
                                            <Link
                                                href={`/main/products/detail/${product.id}`}
                                                aria-label={`Detail ${product.name}`}
                                                className="p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            {status === "active" ? (
                                                <>
                                                    <Link
                                                        href={`/main/products/edit/${product.id}`}
                                                        aria-label={`Ubah ${product.name}`}
                                                        className="p-2 bg-red-50 text-[var(--primary)] rounded-lg cursor-pointer hover:bg-red-100 transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(product)}
                                                        aria-label={`Hapus ${product.name}`}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg cursor-pointer hover:bg-red-100 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={restoringId === product.id}
                                                    onClick={() => handleRestore(product)}
                                                    className="flex items-center gap-1.5 p-2 px-3 bg-[var(--primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all"
                                                >
                                                    <RotateCcw size={16} />
                                                    <span>{restoringId === product.id ? "Memulihkan..." : "Pulihkan"}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {i !== products.length - 1 && <div className="w-full h-[.06rem] bg-gray-800 opacity-15"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {deleteTarget && (
                <>
                    <div
                        className="w-full h-full fixed inset-0 z-9 bg-black transition-all opacity-50 duration-200"
                        onClick={closeDelete}
                    ></div>

                    <div className="fixed bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 min-w-62.5 max-w-sm rounded-lg">
                        <h3 className="text-red-500 text-xl text-center font-semibold">Hapus Produk</h3>

                        <p className="text-center mt-3 text-[var(--text-secondary)]">
                            Yakin ingin menghapus produk <span className="font-semibold">{deleteTarget.name}</span>?
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
