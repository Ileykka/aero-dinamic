export const CATALOG_CATEGORY_KEYS = ["drones", "cameras", "accessories", "microphones"] as const;

export type CatalogCategoryKey = (typeof CATALOG_CATEGORY_KEYS)[number];

export function isCatalogCategoryKey(value: unknown): value is CatalogCategoryKey {
  return typeof value === "string" && (CATALOG_CATEGORY_KEYS as readonly string[]).includes(value);
}
