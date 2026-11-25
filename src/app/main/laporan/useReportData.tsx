'use client'
import { useEffect, useState } from "react"
import type { Transaction } from "./data"

type State = {
  transactions: Transaction[]
  categories: string[]
  loading: boolean
  error: string
}

export function useReportData(): State {
  const [state, setState] = useState<State>({ transactions: [], categories: [], loading: true, error: "" })

  useEffect(() => {
    let active = true

    fetch("/api/laporan", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data dari server.")
        return res.json()
      })
      .then((data) => {
        if (active) {
          setState({ transactions: data.transactions, categories: data.categories, loading: false, error: "" })
        }
      })
      .catch((e) => {
        if (active) {
          setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." }))
        }
      })

    return () => {
      active = false
    }
  }, [])

  return state
}

export function ReportStatus({ loading, error }: { loading: boolean; error: string }) {
  if (loading) {
    return (
      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg text-sm text-[var(--text-secondary)]">
        Memuat data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg text-sm text-red-500">
        {error} Pastikan MySQL menyala dan DATABASE_URL sudah benar.
      </div>
    )
  }

  return null
}