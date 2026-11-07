'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ringkas, rupiah } from "@/app/lib/format";

export type TitikGrafik = { label: string; nilai: number };

const MAROON = "#800000";
const TEKS = "#655656";
const GARIS = "#E2DCD5";

export function GrafikBatang({
  data,
  deskripsi,
}: {
  data: TitikGrafik[];
  deskripsi: string;
}) {
  return (
    <div role="img" aria-label={deskripsi} className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GARIS} />
          <XAxis
            dataKey="label"
            tick={{ fill: TEKS, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: TEKS }}
            minTickGap={12}
          />
          <YAxis
            tick={{ fill: TEKS, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => ringkas(v)}
          />
          <Tooltip
            formatter={(v) => [rupiah(Number(v)), "Pendapatan"]}
            cursor={{ fill: "rgba(128, 0, 0, 0.08)" }}
          />
          <Bar dataKey="nilai" fill={MAROON} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}