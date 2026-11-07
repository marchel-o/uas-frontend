import type { ReactNode } from "react";
import { fokus } from "./gaya";

export type Kolom = { kunci: string; judul: string; kanan?: boolean };
export type Baris = { id: string; sel: Record<string, ReactNode> };

export function Tabel({
  keterangan,
  kolom,
  baris,
}: {
  keterangan: string;
  kolom: Kolom[];
  baris: Baris[];
}) {
  const rata = (k: Kolom) => (k.kanan ? "text-right tabular-nums" : "text-left");

  return (
    <div
      role="region"
      aria-label={keterangan}
      tabIndex={0}
      className={`overflow-x-auto ${fokus}`}
    >
      <table className="w-full min-w-max text-sm">
        <caption className="sr-only">{keterangan}</caption>
        <thead>
          <tr className="border-b border-[color:var(--text-secondary)] text-[var(--text-secondary)]">
            {kolom.map((k) => (
              <th key={k.kunci} scope="col" className={`px-3 py-2 font-semibold ${rata(k)}`}>
                {k.judul}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {baris.map((b) => (
            <tr key={b.id} className="border-b border-[color:var(--border)] last:border-0">
              {kolom.map((k, i) =>
                i === 0 ? (
                  <th key={k.kunci} scope="row" className={`px-3 py-2.5 font-medium ${rata(k)}`}>
                    {b.sel[k.kunci]}
                  </th>
                ) : (
                  <td key={k.kunci} className={`px-3 py-2.5 ${rata(k)}`}>
                    {b.sel[k.kunci]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}