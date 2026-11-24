'use client'

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { ProductForm, ProductInitial } from "../../_components/ProductForm"

export default function EditProduct() {
    const params = useParams<{ id: string }>()
    const id = Number(params.id)

    const [initial, setInitial] = useState<ProductInitial | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`/api/products/${params.id}`)
                const result = await response.json()

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Gagal mengambil data produk")
                }

                const product = result.data

                setInitial({
                    name: product.name,
                    sku: product.sku,
                    buyPrice: product.buyPrice == null ? "" : String(Number(product.buyPrice)),
                    price: String(Number(product.price)),
                    stock: String(product.stock),
                    image: product.image ?? "",
                    categoryId: String(product.categoryId),
                })
            } catch (error) {
                setError(error instanceof Error ? error.message : "Terjadi kesalahan")
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [params.id])

    if (initial) {
        return <ProductForm productId={id} initial={initial} />
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <Link href="/main/products" className="p-2 bg-[var(--surface)] rounded-lg shadow cursor-pointer">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="font-bold text-2xl">
                    Ubah Produk
                </h1>
            </div>

            <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                {loading ? (
                    <p className="text-[var(--text-secondary)] text-sm">Memuat produk...</p>
                ) : (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
            </div>
        </>
    )
}
