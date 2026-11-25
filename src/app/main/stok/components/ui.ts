// Kelas Tailwind bersama untuk halaman stok, mengikuti variabel warna di globals.css.

export const cardClass = "rounded-xl p-4 bg-[var(--surface)] shadow-lg";

export const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]";

export const labelClass = "block text-sm text-[var(--text-secondary)] mb-1";

export const primaryButton =
  "flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white cursor-pointer transition-all hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed";

export const secondaryButton =
  "flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

export const thClass = "py-2 pr-4 text-left font-semibold text-[var(--text-secondary)] whitespace-nowrap";

export const tdClass = "py-3 pr-4 align-top";
