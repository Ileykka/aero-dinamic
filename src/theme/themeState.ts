import { atom } from "recoil";
import { loadTheme, type ThemeId } from "./storage";

export const themeState = atom<ThemeId>({
  key: "themeState",
  default: loadTheme(),
});
