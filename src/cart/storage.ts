import type { CartLine } from "./types";

const CART_KEY = "aero-cart";
const PROMO_KEY = "aero-cart-promo";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadCart(): CartLine[] {
  if (typeof localStorage === "undefined") return [];
  const parsed = safeParse<CartLine[]>(localStorage.getItem(CART_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (line) =>
      line &&
      typeof line.productId === "string" &&
      typeof line.quantity === "number" &&
      line.quantity > 0,
  );
}

export function saveCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch {}
}

export function loadPromoApplied(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(PROMO_KEY) === "1";
}

export function savePromoApplied(applied: boolean): void {
  try {
    if (applied) localStorage.setItem(PROMO_KEY, "1");
    else localStorage.removeItem(PROMO_KEY);
  } catch {}
}
