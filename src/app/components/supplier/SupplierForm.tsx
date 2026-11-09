"use client";

import { useState } from "react";
import Link from "next/link";

type Values = Record<"nama" | "kontak" | "telepon" | "email" | "alamat", string>;

const fields: {
  name: keyof Values;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  rows?: number;
}[] = [
  { name: "nama", label: "Nama supplier", placeholder: "Contoh: PT Sumber Pangan", required: true },
  { name: "kontak", label: "Nama kontak", placeholder: "Nama sales atau PIC" },
  { name: "telepon", label: "Telepon", placeholder: "0812 3456 7890", type: "tel", required: true },
  { name: "email", label: "Email", placeholder: "nama@perusahaan.com", type: "email" },
  { name: "alamat", label: "Alamat", placeholder: "Alamat lengkap supplier", rows: 3 },
];

const empty: Values = { nama: "", kontak: "", telepon: "", email: "", alamat: "" };

function validate(v: Values) {
  const e: Partial<Values> = {};
  if (!v.nama.trim()) e.nama = "Nama supplier wajib diisi.";
  if (!v.telepon.trim()) e.telepon = "Nomor telepon wajib diisi.";
  else if (!/^[0-9+\-\s()]{8,20}$/.test(v.telepon.trim()))
    e.telepon = "Gunakan 8-20 karakter angka, spasi, +, -, atau tanda kurung.";
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email.trim()))
    e.email = "Format email belum benar, contoh: nama@perusahaan.com.";
  return e;
}

export default function SupplierForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // TODO: ganti dengan panggilan ke API / database
    console.log("Supplier baru:", values);
    setValues(empty);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      {saved && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Supplier berhasil ditambahkan.
        </p>
      )}

      {fields.map(({ name, label, required, rows, type, placeholder }) => {
        const props = {
          value: values[name],
          placeholder,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setValues({ ...values, [name]: e.target.value });
            setSaved(false);
          },
          className: `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            errors[name]
              ? "border-red-500 focus:ring-red-500/30"
              : "border-slate-300 focus:border-emerald-700 focus:ring-emerald-700/30"
          }`,
        };
        return (
          <label key={name} className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-800">
              {label}
              {required && <span className="text-red-600"> *</span>}
            </span>
            {rows ? <textarea rows={rows} {...props} /> : <input type={type} {...props} />}
            {errors[name] && <span className="mt-1 block text-sm text-red-600">{errors[name]}</span>}
          </label>
        );
      })}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/supplier" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Batal
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Simpan supplier
        </button>
      </div>
    </form>
  );
}