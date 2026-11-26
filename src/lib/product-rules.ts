export const MAX_PRICE = 9999999999.99;
export const MAX_STOCK = 2147483647;
export const MAX_IMAGE_LENGTH = 500;

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (typeof value === "string" && value.trim() !== "") return Number(value);

  return NaN;
}

export function hasMaxTwoDecimals(value: number) {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-4;
}

export function isValidImageUrl(value: string) {
  return (
    value.length <= MAX_IMAGE_LENGTH &&
    ((value.startsWith("/") && !value.startsWith("//")) ||
      value.startsWith("http://") ||
      value.startsWith("https://"))
  );
}
