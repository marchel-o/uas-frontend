'use client'

import { ArrowLeft, Check, Pencil, Plus, Tag, Trash2, X } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { ConfirmDeleteModal } from "../_components/ConfirmDeleteModal"

type Category = {
    id: number
    name: string
    _count: { products: number }
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [name, setName] = useState("")
    const [adding, setAdding] = useState(false)
    const [addError, setAddError] = useState("")

    const [editId, setEditId] = useState<number | null>(null)
    const [editName, setEditName] = useState("")
    const [saving, setSaving] = useState(false)
    const [editError, setEditError] = useState("")

    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    useEffect(() => {
        let ignore = false

        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories")
                const result = await response.json()

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Gagal mengambil kategori")
                }

                if (!ignore) setCategories(result.data)
            } catch (error) {
                if (!ignore) setError(error instanceof Error ? error.message : "Terjadi kesalahan")
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchCategories()

        return () => {
            ignore = true
        }
    }, [])

    const sortByName = (list: Category[]) =>
        [...list].sort((a, b) => a.name.localeCompare(b.name))

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setAddError("")

        if (adding) return

        const trimmed = name.trim()

        if (trimmed.length < 1 || trimmed.length > 50) {
            setAddError("Nama kategori harus 1-50 karakter")
            return
        }

        try {
            setAdding(true)

            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmed }),
            })
            const result = await response.json()

            if (!response.ok || !result.success) {
                setAddError(result.message || "Gagal menambahkan kategori")
                return
            }

            setCategories((prev) => sortByName([...prev, result.data]))
            setName("")
        } catch {
            setAddError("Gagal terhubung ke server")
        } finally {
            setAdding(false)
        }
    }

    const startEdit = (category: Category) => {
        setEditId(category.id)
        setEditName(category.name)
        setEditError("")
    }

    const cancelEdit = () => {
        setEditId(null)
        setEditName("")
        setEditError("")
    }

    const handleSave = async (id: number) => {
        setEditError("")

        if (saving) return

        const trimmed = editName.trim()

        if (trimmed.length < 1 || trimmed.length > 50) {
            setEditError("Nama kategori harus 1-50 karakter")
            return
        }

        try {
            setSaving(true)

            const response = await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmed }),
            })
            const result = await response.json()

            if (!response.ok || !result.success) {
                setEditError(result.message || "Gagal mengubah kategori")
                return
            }

            setCategories((prev) =>
                sortByName(prev.map((item) => (item.id === id ? result.data : item)))
            )
            cancelEdit()
        } catch {
            setEditError("Gagal terhubung ke server")
        } finally {
            setSaving(false)
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

            const response = await fetch(`/api/categories/${deleteTarget.id}`, {
                method: "DELETE",
            })
            const result = await response.json()

            if (!response.ok || !result.success) {
                setDeleteError(result.message || "Gagal menghapus kategori")
                return
            }

            setCategories((prev) => prev.filter((item) => item.id !== deleteTarget.id))
            closeDelete()
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
                    Kategori Produk
                </h1>
            </div>

            <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                <h3 className="font-bold text-[1.05rem]">Tambah Kategori</h3>

                <form className="flex gap-2 mt-3" onSubmit={handleAdd}>
                    <input
                        className="flex-1 min-w-0 rounded-lg border border-gray-300 p-2 px-3 text-sm outline-none"
                        type="text"
                        placeholder="Nama kategori"
                        maxLength={50}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={adding}
                        className="flex items-center gap-1.5 p-2 px-3 bg-[var(--primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all"
                    >
                        <Plus size={16} />
                        <span>{adding ? "Menyimpan..." : "Tambah"}</span>
                    </button>
                </form>

                {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
            </div>

            <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                <div className="flex items-center gap-2.5">
                    <div className="p-3 bg-red-50 rounded">
                        <Tag size={20} className="text-[var(--primary)]" />
                    </div>
                    <div>
                        <p className="font-semibold text-[1.1rem]">Daftar Kategori</p>
                        <p className="text-[var(--text-secondary)] text-[.8rem]">{categories.length} kategori</p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-[var(--text-secondary)] text-sm mt-4">Memuat kategori...</p>
                ) : error ? (
                    <p className="text-red-500 text-sm mt-4">{error}</p>
                ) : categories.length === 0 ? (
                    <p className="text-[var(--text-secondary)] text-sm mt-4">Belum ada kategori</p>
                ) : (
                    <div className="mt-3 flex flex-col gap-2">
                        {categories.map((category, i) => (
                            <React.Fragment key={category.id}>
                                {editId === category.id ? (
                                    <div className="mx-2">
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 min-w-0 rounded-lg border border-gray-300 p-2 px-3 text-sm outline-none"
                                                type="text"
                                                maxLength={50}
                                                autoFocus
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !saving) handleSave(category.id)
                                                    if (e.key === "Escape") cancelEdit()
                                                }}
                                            />
                                            <button
                                                type="button"
                                                disabled={saving}
                                                onClick={() => handleSave(category.id)}
                                                aria-label="Simpan"
                                                className="p-2 bg-[var(--primary)] text-white rounded-lg cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                aria-label="Batal"
                                                className="p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        {editError && <p className="text-red-500 text-sm mt-2">{editError}</p>}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-2 mx-2">
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">{category.name}</p>
                                            <p className="text-[var(--text-secondary)] text-sm">{category._count.products} produk</p>
                                        </div>

                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(category)}
                                                aria-label={`Ubah ${category.name}`}
                                                className="p-2 bg-red-50 text-[var(--primary)] rounded-lg cursor-pointer hover:bg-red-100 transition-all"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={category._count.products > 0}
                                                title={category._count.products > 0 ? "Kategori masih dipakai produk" : undefined}
                                                onClick={() => setDeleteTarget(category)}
                                                aria-label={`Hapus ${category.name}`}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg cursor-pointer hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {i !== categories.length - 1 && <div className="w-full h-[.06rem] bg-gray-800 opacity-15"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {deleteTarget && (
                <ConfirmDeleteModal
                    title="Hapus Kategori"
                    description={
                        <>
                            Yakin ingin menghapus kategori <span className="font-semibold text-[var(--text-primary)]">{deleteTarget.name}</span>?
                        </>
                    }
                    error={deleteError}
                    deleting={deleting}
                    onCancel={closeDelete}
                    onConfirm={handleDelete}
                />
            )}
        </>
    )
}
