const CURRENCY = {
  locale: "id-ID",
  code: "IDR",
  decimals: 0,
};

export function formatMoney(value: number | string | null | undefined): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: CURRENCY.decimals,
    maximumFractionDigits: CURRENCY.decimals,
  }).format(Number(value ?? 0));
}
