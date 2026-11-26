"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Values = Record<"name" | "contactName" | "phone" | "email" | "address", string>;

const fields: {
  name: keyof Values;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  rows?: number;
}[] = [
  { name: "name", label: "Nama supplier", placeholder: "Contoh: PT Sumber Pangan", required: true },
  { name: "contactName", label: "Nama kontak", placeholder: "Nama sales atau PIC" },
  { name: "phone", label: "Telepon", placeholder: "0812 3456 7890", type: "tel", required: true },
  { name: "email", label: "Email", placeholder: "nama@perusahaan.com", type: "email" },
  { name: "address", label: "Alamat", placeholder: "Alamat lengkap supplier", rows: 3 },
];

const empty: Values = { name: "", contactName: "", phone: "", email: "", address: "" };

function validate(v: Values) {
  const e: Partial<Values> = {};
  if (!v.name.trim()) e.name = "Nama supplier wajib diisi.";
  if (!v.phone.trim()) e.phone = "Nomor telepon wajib diisi.";
  else if (!/^[0-9+\-\s()]{8,20}$/.test(v.phone.trim()))
    e.phone = "Gunakan 8-20 karakter angka, spasi, +, -, atau tanda kurung.";
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email.trim()))
    e.email = "Format email belum benar, contoh: nama@perusahaan.com.";
  return e;
}

export default function SupplierForm() {
  const router = useRouter();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setServerError(result.message || "Gagal menyimpan supplier");
        return;
      }

      router.push("/main/supplier");
      router.refresh();
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
      {serverError && (
        <p role="alert" className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">
          {serverError}
        </p>
      )}

      {fields.map(({ name, label, required, rows, type, placeholder }) => {
        const props = {
          value: values[name],
          placeholder,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValues({ ...values, [name]: e.target.value }),
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
            {errors[name] && (
              <span className="mt-1 block text-sm text-red-600">{errors[name]}</span>
            )}
          </label>
        );
      })}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/main/supplier"
          className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-100"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-light)] hover:bg-[var(--primary-hover)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Menyimpan..." : "Simpan supplier"}
        </button>
      </div>
    </form>
  );
}