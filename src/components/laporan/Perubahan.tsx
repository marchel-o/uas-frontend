import { TrendingDown, TrendingUp } from "lucide-react";
import { persen } from "@/app/lib/format";

export function Perubahan({ nilai }: { nilai: number | null }) {
  if (nilai === null) {
    return (
      <>
        <span aria-hidden="true">-</span>
        <span className="sr-only">tidak ada pembanding</span>
      </>
    );
  }

  const naik = nilai >= 0;
  const Ikon = naik ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        naik ? "text-[var(--success)]" : "text-[var(--danger)]"
      }`}
    >
      <Ikon size={16} aria-hidden="true" />
      {persen(nilai)}
      <span className="sr-only">{nilai > 0 ? "naik" : nilai < 0 ? "turun" : "tetap"}</span>
    </span>
  );
}