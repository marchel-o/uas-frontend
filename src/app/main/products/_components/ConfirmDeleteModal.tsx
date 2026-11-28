'use client'

import React, { useEffect, useId } from "react"

type ConfirmDeleteModalProps = {
    title: string
    description: React.ReactNode
    error?: string
    deleting: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function ConfirmDeleteModal({
    title,
    description,
    error,
    deleting,
    onCancel,
    onConfirm,
}: ConfirmDeleteModalProps) {
    const titleId = useId()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !deleting) {
                onCancel()
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [deleting, onCancel])

    return (
        <div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => {
                if (e.target === e.currentTarget && !deleting) {
                    onCancel()
                }
            }}
        >
            <div className="w-full max-w-sm rounded-xl bg-[var(--surface)] p-5 shadow-lg">
                <h2 id={titleId} className="font-bold text-lg">
                    {title}
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {description}
                </p>

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        autoFocus
                        disabled={deleting}
                        onClick={onCancel}
                        className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={deleting}
                        onClick={onConfirm}
                        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {deleting ? "Menghapus..." : "Hapus"}
                    </button>
                </div>
            </div>
        </div>
    )
}
