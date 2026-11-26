'use client'

import { ArrowLeft, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import {
    MAX_PRICE,
    MAX_STOCK,
    hasMaxTwoDecimals,
    isValidImageUrl,
} from "@/lib/product-rules"

export type ProductInitial = {
    name: string
    sku: string
    buyPrice: string
    price: string
    stock: string
    image: string
    categoryId: string
}

type Category = {
    id: number
    name: string
}

type ProductFormProps = {
    productId?: number
    initial?: ProductInitial
}

const emptyForm: ProductInitial = {
    name: "",
    sku: "",
    buyPrice: "",
    price: "",
    stock: "",
    image: "",
    categoryId: "",
}

const inputClass = "mt-1 w-full rounded-lg border border-gray-300 p-2 px-3 text-sm outline-none"
const labelClass = "text-[var(--text-secondary)] text-sm"

export function ProductForm({ productId, initial }: ProductFormProps) {
    const router = useRouter()
    const [form, setForm] = useState<ProductInitial>(initial ?? emptyForm)
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const isEdit = productId !== undefined

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
            } finally {
                setLoadingCategories(false)
            }
        }

        fetchCategories()
    }, [])

    const setField = (key: keyof ProductInitial, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const validate = () => {
        if (form.name.trim().length < 2 || form.name.trim().length > 100) {
            return "Nama produk harus 2-100 karakter"
        }

        if (form.sku.trim().length < 2 || form.sku.trim().length > 50) {
            return "SKU harus 2-50 karakter"
        }

        if (!form.categoryId) {
            return "Kategori wajib dipilih"
        }

        const price = Number(form.price)

        if (form.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
            return "Harga jual harus lebih dari 0"
        }

        if (price > MAX_PRICE) {
            return "Harga jual tidak boleh melebihi 9.999.999.999,99"
        }

        if (!hasMaxTwoDecimals(price)) {
            return "Harga jual maksimal 2 angka desimal"
        }

        if (form.buyPrice.trim() !== "") {
            const buyPrice = Number(form.buyPrice)

            if (!Number.isFinite(buyPrice) || buyPrice < 0) {
                return "Harga beli tidak valid"
            }

            if (buyPrice > MAX_PRICE) {
                return "Harga beli tidak boleh melebihi 9.999.999.999,99"
            }

            if (!hasMaxTwoDecimals(buyPrice)) {
                return "Harga beli maksimal 2 angka desimal"
            }
        }

        if (form.stock.trim() !== "") {
            const stock = Number(form.stock)

            if (!Number.isInteger(stock) || stock < 0) {
                return "Stok harus bilangan bulat 0 atau lebih"
            }

            if (stock > MAX_STOCK) {
                return "Stok tidak boleh melebihi 2.147.483.647"
            }
        }

        if (form.image.trim() !== "" && !isValidImageUrl(form.image.trim())) {
            return "URL gambar harus diawali /, http://, atau https:// dan maksimal 500 karakter"
        }

        return ""
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const validation = validate()

        if (validation) {
            setError(validation)
            return
        }

        const payload = {
            name: form.name.trim(),
            sku: form.sku.trim(),
            buyPrice: form.buyPrice.trim() === "" ? null : Number(form.buyPrice),
            price: Number(form.price),
            stock: form.stock.trim() === "" ? 0 : Number(form.stock),
            image: form.image.trim() === "" ? null : form.image.trim(),
            categoryId: Number(form.categoryId),
        }

        try {
            setSaving(true)

            const response = await fetch(
                isEdit ? `/api/products/${productId}` : "/api/products",
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )
            const result = await response.json()

            if (!response.ok || !result.success) {
                setError(result.message || "Gagal menyimpan produk")
                return
            }

            router.push("/main/products")
        } catch {
            setError("Gagal terhubung ke server")
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <Link href="/main/products" className="p-2 bg-[var(--surface)] rounded-lg shadow cursor-pointer">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="font-bold text-2xl">
                    {isEdit ? "Ubah Produk" : "Tambah Produk"}
                </h1>
            </div>

            <form className="rounded-xl p-4 bg-[var(--surface)] shadow-lg" onSubmit={handleSubmit}>
                <h3 className="font-bold text-[1.05rem]">Informasi Barang</h3>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex flex-col gap-3 mt-3">
                    <div>
                        <label className={labelClass} htmlFor="product-name">Nama Produk</label>
                        <input
                            id="product-name"
                            className={inputClass}
                            type="text"
                            maxLength={100}
                            value={form.name}
                            onChange={(e) => setField("name", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="product-sku">Kode Barcode (SKU)</label>
                        <input
                            id="product-sku"
                            className={inputClass}
                            type="text"
                            maxLength={50}
                            value={form.sku}
                            onChange={(e) => setField("sku", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="product-category">Kategori</label>
                        <div className="relative w-full">
                            <select
                                id="product-category"
                                className="mt-1 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm outline-none cursor-pointer hover:bg-gray-50 transition-all"
                                value={form.categoryId}
                                disabled={loadingCategories}
                                onChange={(e) => setField("categoryId", e.target.value)}
                            >
                                <option value="">{loadingCategories ? "Memuat kategori..." : "Pilih Kategori"}</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 mt-1 text-gray-500">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass} htmlFor="product-buy-price">Harga Beli (Modal)</label>
                            <input
                                id="product-buy-price"
                                className={inputClass}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Opsional"
                                value={form.buyPrice}
                                onChange={(e) => setField("buyPrice", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="product-price">Harga Jual</label>
                            <input
                                id="product-price"
                                className={inputClass}
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={(e) => setField("price", e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="product-stock">Stok</label>
                        <input
                            id="product-stock"
                            className={inputClass}
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={form.stock}
                            onChange={(e) => setField("stock", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="product-image">URL Gambar</label>
                        <input
                            id="product-image"
                            className={inputClass}
                            type="text"
                            maxLength={500}
                            placeholder="Opsional, contoh: https://..."
                            value={form.image}
                            onChange={(e) => setField("image", e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full h-[.06rem] bg-gray-800 opacity-15 my-6"></div>

                <div className="flex gap-2">
                    <Link
                        href="/main/products"
                        className="p-2 px-3 border border-gray-300 rounded-lg text-sm text-center cursor-pointer hover:bg-gray-100 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="p-2 px-3 bg-[var(--primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all"
                    >
                        {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Produk"}
                    </button>
                </div>
            </form>
        </>
    )
}
