import { fokus } from "./gaya";

export function PilihanSelect({
  id,
  label,
  nilai,
  opsi,
  onUbah,
}: {
  id: string;
  label: string;
  nilai: string;
  opsi: { nilai: string; label: string }[];
  onUbah: (nilai: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
        className={`min-h-11 rounded-md border border-[color:var(--text-secondary)] bg-[var(--surface)] px-3 text-sm hover:border-[color:var(--text-primary)] ${fokus}`}
      >
        {opsi.map((o) => (
          <option key={o.nilai} value={o.nilai}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}