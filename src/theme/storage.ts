export type ThemeId = "dark" | "light";

const THEME_KEY = "aero-theme";

export function loadTheme(): ThemeId {
  if (typeof localStorage === "undefined") return "dark";
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "light" ? "light" : "dark";
}

export function saveTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
