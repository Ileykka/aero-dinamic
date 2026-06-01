import type { FavoriteLine } from "./types";

const FAVORITES_KEY = "aero-favorites";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadFavorites(): FavoriteLine[] {
  if (typeof localStorage === "undefined") return [];
  const parsed = safeParse<FavoriteLine[]>(localStorage.getItem(FAVORITES_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((line) => line && typeof line.productId === "string");
}

export function saveFavorites(lines: FavoriteLine[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(lines));
  } catch {}
}
