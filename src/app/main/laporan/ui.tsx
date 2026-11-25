'use client'

import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatRupiah, shortRupiah } from "./data"

export function StatCard({
  icon,
  title,
  value,
  unit,
  badge,
}: {
  icon: ReactNode
  title: string
  value: string | number
  unit?: string
  badge?: { text: string; green: boolean }
}) {
  return (
    <div className="relative rounded-xl p-4 bg-[var(--surface)] shadow-lg">
      <div className="flex items-center gap-2">
        <span className="p-1 bg-gray-200 rounded text-gray-500">{icon}</span>
        <p className="font-semibold text-[.9em]">{title}</p>
      </div>

      <div className="flex justify-between mt-4 gap-2">
        <p className="flex items-center gap-1.5 font-semibold text-2xl">
          {value} {unit && <span className="text-sm text-[var(--text-secondary)]">{unit}</span>}
        </p>

        {badge && (
          <p
            className={`p-0.5 px-2 text-[.7em] ${badge.green ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"} rounded text-center font-[550] self-center`}
          >
            {badge.text}
          </p>
        )}
      </div>
    </div>
  )
}

export function RevenueChart({ data }: { data: { label: string; revenue: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DCD5" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => shortRupiah(Number(v))}
          />
          <Tooltip formatter={(v) => formatRupiah(Number(v))} cursor={{ fill: "#F4F1EA" }} />
          <Bar dataKey="revenue" name="Pendapatan" fill="#800000" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const inputClass =
  "rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm outline-none focus:border-[var(--primary)]"