export function formatPrice(amountByn: number): string {
  const formatted = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amountByn);
  return `${formatted.replace(/\u00A0/g, " ")} BYN`;
}
