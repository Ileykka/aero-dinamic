import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../../auth/AuthContext";
import { useRequireAuth } from "../../../auth/useRequireAuth";
import { useCart } from "../../../cart/CartContext";
import { isCatalogCategoryKey, type CatalogCategoryKey } from "../../../catalog/categories";
import styles from "./Header.module.css";
import logo from "../../../assets/img/main/logo.svg";
import logoDark from "../../../assets/img/main/logo-dark.svg";
import { useTheme } from "../../../theme/ThemeContext";
import searchIcon from "../../../assets/img/main/search.svg?raw";
import heartIcon from "../../../assets/img/main/heart.svg?raw";
import bucketIcon from "../../../assets/img/main/bucket.svg?raw";
import authorizationIcon from "../../../assets/img/main/authorization.svg?raw";

export const Header = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { requireAuth } = useRequireAuth();
    const { itemCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const querySnapshotRef = useRef("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");

    const buildCatalogSearch = useCallback(
        (qNext: string) => {
            const trimmed = qNext.trim();
            const raw =
                location.pathname === "/catalog"
                    ? (location.search as { category?: unknown; q?: unknown })
                    : {};
            const next: { category?: CatalogCategoryKey; q?: string } = {};
            if (raw.category && isCatalogCategoryKey(raw.category)) {
                next.category = raw.category;
            }
            if (trimmed) next.q = trimmed;
            return next;
        },
        [location.pathname, location.search],
    );

    useEffect(() => {
        if (!searchOpen) return;
        inputRef.current?.focus();
    }, [searchOpen]);

    const cancelSearch = useCallback(() => {
        setQuery(querySnapshotRef.current);
        setSearchOpen(false);
    }, []);

    useEffect(() => {
        if (!searchOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") cancelSearch();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [searchOpen, cancelSearch]);

    const openSearch = () => {
        const raw = (location.search as { q?: unknown }).q;
        const fromUrl = typeof raw === "string" ? raw : "";
        querySnapshotRef.current = fromUrl;
        setQuery(fromUrl);
        setSearchOpen(true);
    };

    const onSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        navigate({
            to: "/catalog",
            search: buildCatalogSearch(query),
        });
        setSearchOpen(false);
    };

    return (
        <header className={styles["site-header"]}>
            <Link to="/" className={styles["site-header__logo"]} aria-label="AERO Store">
                <img className={styles["site-header__logo-image"]} src={theme === "light" ? logoDark : logo} alt="AERO Store" />
            </Link>
            {searchOpen ? (
                <form className={styles["site-header__search-slot"]} onSubmit={onSearchSubmit}>
                    <div className={styles["site-header__search-field"]}>
                        <button
                            type="submit"
                            className={styles["site-header__search-submit"]}
                            aria-label="Искать"
                        >
                            <span
                                className={`${styles["site-header__icon"]} ${styles["site-header__icon--search-inline"]}`}
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{ __html: searchIcon }}
                            />
                        </button>
                        <input
                            ref={inputRef}
                            className={styles["site-header__search-input"]}
                            type="text"
                            name="q"
                            placeholder="Поиск по каталогу"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            enterKeyHint="search"
                            aria-label="Поиск по каталогу"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className={styles["site-header__search-close"]}
                            onClick={cancelSearch}
                            aria-label="Закрыть поиск и отменить"
                        >
                            <span className={styles["site-header__icon"]} aria-hidden="true">
                                <svg
                                    className={styles["site-header__close-svg"]}
                                    width="45"
                                    height="45"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M7 7l10 10M17 7L7 17"
                                        stroke="currentColor"
                                        strokeWidth="0.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                        </button>
                    </div>
                </form>
            ) : (
                <nav className={styles["site-header__nav"]}>
                    <Link to="/catalog" className={styles["site-header__nav-link"]}>
                        Каталог
                    </Link>
                    <Link to="/about" className={styles["site-header__nav-link"]}>
                        О нас
                    </Link>
                    <Link to="/contacts" className={styles["site-header__nav-link"]}>
                        Контакты
                    </Link>
                    <Link to="/delivery" className={styles["site-header__nav-link"]}>
                        Доставка
                    </Link>
                </nav>
            )}
            <div className={styles["site-header__controls"]}>
                {!searchOpen ? (
                    <button
                        className={styles["site-header__search"]}
                        type="button"
                        aria-label="Открыть поиск"
                        aria-expanded={false}
                        onClick={openSearch}
                    >
                        <span
                            className={`${styles["site-header__icon"]} ${styles["site-header__icon--search"]}`}
                            aria-hidden="true"
                            dangerouslySetInnerHTML={{ __html: searchIcon }}
                        />
                    </button>
                ) : null}
                <button
                    className={styles["site-header__action"]}
                    type="button"
                    aria-label="Избранное"
                    onClick={() => requireAuth(() => navigate({ to: "/favorites" }))}
                >
                    <span
                        className={`${styles["site-header__icon"]} ${styles["site-header__icon--favorites"]}`}
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: heartIcon }}
                    />
                </button>
                <Link
                    to="/cart"
                    className={styles["site-header__action"]}
                    aria-label={itemCount > 0 ? `Корзина, ${itemCount} товаров` : "Корзина"}
                    onClick={(e) => {
                        if (!user) {
                            e.preventDefault();
                            requireAuth();
                        }
                    }}
                >
                    <span
                        className={`${styles["site-header__icon"]} ${styles["site-header__icon--cart"]}`}
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: bucketIcon }}
                    />
                    {itemCount > 0 ? (
                        <span className={styles["site-header__cart-badge"]}>{itemCount}</span>
                    ) : null}
                </Link>
                {user ? (
                    <Link
                        to="/profile"
                        className={styles["site-header__action"]}
                        aria-label={`Профиль: ${[user.name, user.surname].filter(Boolean).join(" ")}`}
                        title={user.email}
                    >
                        <span
                            className={`${styles["site-header__icon"]} ${styles["site-header__icon--account"]}`}
                            aria-hidden="true"
                            dangerouslySetInnerHTML={{ __html: authorizationIcon }}
                        />
                    </Link>
                ) : (
                    <Link to="/login" className={styles["site-header__action"]} aria-label="Вход в аккаунт">
                        <span
                            className={`${styles["site-header__icon"]} ${styles["site-header__icon--account"]}`}
                            aria-hidden="true"
                            dangerouslySetInnerHTML={{ __html: authorizationIcon }}
                        />
                    </Link>
                )}
            </div>
        </header>
    );
};
