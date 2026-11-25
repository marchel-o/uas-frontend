'use client'

import { useEffect, useState } from "react";
import type { StockProduct } from "@/lib/stock";

// Mengambil daftar produk dari /api/products. Panggil reload() setelah stok berubah.
export function useProducts() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/products");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message ?? "Gagal mengambil data produk");
        }

        if (!cancelled) {
          // Barang nonaktif (isActive = false) tidak ikut dikelola di halaman stok
          setProducts(
            (result.data as StockProduct[]).filter((p) => p.isActive !== false)
          );
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = () => setVersion((v) => v + 1);

  return { products, loading, error, reload };
}
