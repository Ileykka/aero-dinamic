import { useTheme } from "../../../theme/ThemeContext";
import styles from "./Footer.module.css";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className={styles["site-footer__theme"]}>
      <span className={styles["site-footer__theme-text"]}>Тема</span>
      <button
        type="button"
        className={styles["site-footer__theme-switch"]}
        role="switch"
        aria-checked={isLight}
        aria-label={isLight ? "Светлая тема" : "Тёмная тема"}
        onClick={() => setTheme(isLight ? "dark" : "light")}
      >
        <span className={styles["site-footer__theme-track"]}>
          <span className={styles["site-footer__theme-thumb"]} />
        </span>
      </button>
      <span className={styles["site-footer__theme-mode"]}>{isLight ? "Светлая" : "Темная"}</span>
    </div>
  );
};
