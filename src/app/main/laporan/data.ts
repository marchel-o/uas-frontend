import { formatMoney } from "@/lib/format";

export type Category = string;

export type Item = { product: string; category: Category; qty: number; price: number };
export type Transaction = { id: string; date: string; time: string; items: Item[] };
export const TODAY = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

const categoryStyle: Record<string, string> = {
  Makanan: "bg-red-100 text-red-800",
  Minuman: "bg-sky-100 text-sky-800",
  Snack: "bg-amber-100 text-amber-800",
};

export const categoryClass = (category: Category) => categoryStyle[category] ?? "bg-gray-100 text-gray-800";

// Nama fungsi dipertahankan agar file lain yang mengimpornya tetap jalan.
export const formatRupiah = (num: number) => formatMoney(num);

export const shortRupiah = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} jt`;
  if (num >= 1_000) return `${Math.round(num / 1_000)} rb`;
  return String(num);
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function lastDayOfMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export const txTotal = (t: Transaction) => t.items.reduce((s, i) => s + i.qty * i.price, 0);
export const txQty = (t: Transaction) => t.items.reduce((s, i) => s + i.qty, 0);
export const itemsText = (t: Transaction) => t.items.map((i) => `${i.product} x${i.qty}`).join(", ");

export function filterRange(list: Transaction[], from?: string, to?: string) {
  return list.filter((t) => (!from || t.date >= from) && (!to || t.date <= to));
}

export function summarize(list: Transaction[]) {
  const revenue = list.reduce((s, t) => s + txTotal(t), 0);
  const qty = list.reduce((s, t) => s + txQty(t), 0);
  const count = list.length;
  return { revenue, qty, count, avg: count ? Math.round(revenue / count) : 0 };
}

export function groupByDay(list: Transaction[], from: string, to: string) {
  const map = new Map<string, { revenue: number; count: number }>();
  for (let d = from; d <= to; d = addDays(d, 1)) map.set(d, { revenue: 0, count: 0 });
  for (const t of list) {
    const row = map.get(t.date);
    if (row) {
      row.revenue += txTotal(t);
      row.count += 1;
    }
  }
  return Array.from(map, ([date, v]) => ({ date, ...v }));
}

export function groupByHour(list: Transaction[]) {
  const rows = [];
  for (let h = 8; h <= 20; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    const inHour = list.filter((t) => Number(t.time.slice(0, 2)) === h);
    rows.push({ label, revenue: inHour.reduce((s, t) => s + txTotal(t), 0) });
  }
  return rows;
}

export function topProducts(list: Transaction[], category: Category | "" = "") {
  const map = new Map<string, { product: string; category: Category; qty: number; revenue: number }>();
  for (const t of list) {
    for (const i of t.items) {
      if (category && i.category !== category) continue;
      const row = map.get(i.product) ?? { product: i.product, category: i.category, qty: 0, revenue: 0 };
      row.qty += i.qty;
      row.revenue += i.qty * i.price;
      map.set(i.product, row);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
}
