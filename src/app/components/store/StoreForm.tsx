"use client";

import { useState } from "react";

export type StoreValues = {
  name: string;
  address: string;
  phone: string;
  email: string;
  receiptNote: string;
};

const fields: {
  name: keyof StoreValues;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}[] = [
  { name: "name", label: "Nama toko", placeholder: "Contoh: Toko Makmur Jaya", required: true },
  { name: "address", label: "Alamat", placeholder: "Alamat lengkap toko", rows: 3 },
  { name: "phone", label: "Telepon", placeholder: "0812 3456 7890", type: "tel" },
  { name: "email", label: "Email", placeholder: "toko@email.com", type: "email" },
  {
    name: "receiptNote",
    label: "Catatan struk",
    placeholder: "Contoh: Terima kasih sudah berbelanja!",
    rows: 2,
    hint: "Teks tambahan yang bisa dipakai di bagian bawah struk.",
  },
];

function validate(v: StoreValues) {
  const e: Partial<StoreValues> = {};
  if (!v.name.trim()) e.name = "Nama toko wajib diisi.";
  if (v.phone && !/^[0-9+\-\s()]{8,20}$/.test(v.phone.trim()))
    e.phone = "Gunakan 8-20 karakter angka, spasi, +, -, atau tanda kurung.";
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email.trim()))
    e.email = "Format email belum benar, contoh: toko@email.com.";
  return e;
}

export default function StoreForm({ initial }: { initial: StoreValues }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<StoreValues>>({});
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    setServerError("");
    setSaved(false);

    try {
      const res = await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setServerError(result.message || "Gagal menyimpan informasi toko");
        return;
      }

      setSaved(true);
    } catch {
      setServerError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-xl p-4 bg-[var(--surface)] shadow-lg"
    >
      {saved && (
        <p role="status" className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">
          Informasi toko berhasil disimpan.
        </p>
      )}
      {serverError && (
        <p role="alert" className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">
          {serverError}
        </p>
      )}

      {fields.map(({ name, label, required, rows, type, placeholder, hint }) => {
        const props = {
          value: values[name],
          placeholder,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setValues({ ...values, [name]: e.target.value });
            setSaved(false);
          },
          className: `w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
            errors[name]
              ? "border-red-500 focus:ring-red-500/30"
              : "border-gray-300 focus:border-[var(--primary)] focus:ring-[var(--primary)]/30"
          }`,
        };

        return (
          <label key={name} className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {label}
              {required && <span className="text-red-600"> *</span>}
            </span>
            {rows ? <textarea rows={rows} {...props} /> : <input type={type} {...props} />}
            {hint && !errors[name] && (
              <span className="mt-1 block text-xs text-[var(--text-secondary)]">{hint}</span>
            )}
            {errors[name] && (
              <span className="mt-1 block text-sm text-red-600">{errors[name]}</span>
            )}
          </label>
        );
      })}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-light)] hover:bg-[var(--primary-hover)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}