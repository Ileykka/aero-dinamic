import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { CatalogCategoryKey } from "../../../catalog/categories";
import { isCatalogCategoryKey } from "../../../catalog/categories";
import { useRequireAuth } from "../../../auth/useRequireAuth";
import { useCart } from "../../../cart/CartContext";
import { useFavorites } from "../../../favorites/FavoritesContext";
import products, { getCardImage, type BrandKey, type Product } from "../../../catalog/products";
import { formatPrice } from "../../../lib/formatPrice";
import styles from "./Catalog.module.css";

const categoryTabs: { label: string; key: CatalogCategoryKey }[] = [
  { label: "Дроны", key: "drones" },
  { label: "Камеры", key: "cameras" },
  { label: "Аксессуары", key: "accessories" },
  { label: "Микрофоны", key: "microphones" },
];

type CatalogItem = Product & { image: string };

const fullCatalog: CatalogItem[] = products.map((p) => ({ ...p, image: getCardImage(p) }));

const ITEMS_PER_PAGE = 9;

const SORT_OPTIONS = [
  { id: "default" as const, label: "По умолчанию" },
  { id: "price-asc" as const, label: "Сначала дешёвые" },
  { id: "price-desc" as const, label: "Сначала дорогие" },
  { id: "name" as const, label: "По названию" },
];

type SortId = (typeof SORT_OPTIONS)[number]["id"];

const parseFilterPrice = (raw: string): number | null => {
  const trimmed = raw.trim().replace(/\s/g, "");
  if (trimmed === "") return null;
  const n = parseInt(trimmed.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

export const Catalog = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = useMemo((): CatalogCategoryKey | null => {
    const raw = (location.search as { category?: unknown }).category;
    return isCatalogCategoryKey(raw) ? raw : null;
  }, [location.search]);

  const searchText = useMemo(() => {
    const raw = (location.search as { q?: unknown }).q;
    return typeof raw === "string" ? raw.trim().toLowerCase() : "";
  }, [location.search]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortId>("default");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [brands, setBrands] = useState<Record<BrandKey, boolean>>({
    DJI: false,
    GoPro: false,
    Autel: false,
  });
  const { requireAuth } = useRequireAuth();
  const { isInCart, toggleCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const setCategoryFilter = useCallback(
    (key: CatalogCategoryKey) => {
      if (selectedCategory === key) {
        navigate({ to: "/catalog", search: {} } as unknown as Parameters<typeof navigate>[0]);
      } else {
        navigate({ to: "/catalog", search: { category: key } } as unknown as Parameters<typeof navigate>[0]);
      }
    },
    [navigate, selectedCategory],
  );

  const brandFilterActive = brands.DJI || brands.GoPro || brands.Autel;

  const filteredItems = useMemo(() => {
    const fromN = parseFilterPrice(priceFrom);
    const toN = parseFilterPrice(priceTo);

    return fullCatalog.filter((item) => {
      if (selectedCategory !== null && item.category !== selectedCategory) return false;

      if (brandFilterActive && !brands[item.brand]) return false;

      if (fromN !== null && item.priceBYN < fromN) return false;
      if (toN !== null && item.priceBYN > toN) return false;

      if (searchText) {
        const hay = `${item.name} ${item.shortDescription} ${item.brand}`.toLowerCase();
        if (!hay.includes(searchText)) return false;
      }

      return true;
    });
  }, [selectedCategory, brandFilterActive, brands, priceFrom, priceTo, searchText]);

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    switch (sortBy) {
      case "price-asc":
        return items.sort((a, b) => a.priceBYN - b.priceBYN);
      case "price-desc":
        return items.sort((a, b) => b.priceBYN - a.priceBYN);
      case "name":
        return items.sort((a, b) => a.name.localeCompare(b.name, "ru"));
      default:
        return items;
    }
  }, [filteredItems, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceFrom, priceTo, brands.DJI, brands.GoPro, brands.Autel, searchText]);

  useEffect(() => {
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  const goPage = useCallback(
    (p: number) => {
      if (p < 1 || p > totalPages) return;
  
      setCurrentPage(p);
  
      window.scrollTo(0, 0);
    },
    [totalPages],
  );

  const toggleBrand = (key: BrandKey) => {
    setBrands((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onToggleFavorite = (id: string) => {
    requireAuth(() => toggleFavorite(id));
  };

  const onToggleCart = (id: string) => {
    requireAuth(() => toggleCart(id));
  };

  const isEmpty = sortedItems.length === 0;

  return (
    <main className="page__content">
      <section className={styles.catalog}>
        <h1 className={styles["catalog__title"]}>Каталог товаров</h1>

        <div className={styles["catalog__layout"]}>
          <aside className={styles.filters}>
            <h2 className={styles["filters__title"]}>Фильтры</h2>

            <div className={styles["filters__block"]}>
              <h3 className={styles["filters__label"]}>Цена (BYN)</h3>
              <div className={styles["filters__range"]}>
                <label className={styles["filters__field"]}>
                  <input
                    className={styles["filters__input"]}
                    type="text"
                    inputMode="numeric"
                    placeholder="От"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                  />
                </label>
                <label className={styles["filters__field"]}>
                  <input
                    className={styles["filters__input"]}
                    type="text"
                    inputMode="numeric"
                    placeholder="До"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className={styles["filters__block"]}>
              <h3 className={styles["filters__label"]}>Бренд</h3>
              <div className={styles["filters__checks"]}>
                {(["DJI", "GoPro", "Autel"] as const).map((b) => (
                  <label key={b} className={styles["filters__check"]}>
                    <input
                      className={styles["filters__check-input"]}
                      type="checkbox"
                      checked={brands[b]}
                      onChange={() => toggleBrand(b)}
                    />
                    <span className={styles["filters__check-box"]} aria-hidden="true" />
                    <span className={styles["filters__check-text"]}>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <h2 className={`${styles["filters__title"]} ${styles["filters__title--sort"]}`}>Сортировка</h2>
            <div className={styles["filters__sort"]} role="radiogroup" aria-label="Сортировка">
              {SORT_OPTIONS.map((opt) => (
                <label key={opt.id} className={styles["filters__check"]}>
                  <input
                    className={styles["filters__check-input"]}
                    type="radio"
                    name="catalog-sort"
                    value={opt.id}
                    checked={sortBy === opt.id}
                    onChange={() => setSortBy(opt.id)}
                  />
                  <span className={styles["filters__check-box"]} aria-hidden="true" />
                  <span className={styles["filters__check-text"]}>{opt.label}</span>
                </label>
              ))}
            </div>
          </aside>

          <div className={styles["catalog__content"]}>
            <div className={styles["catalog__tabs"]} role="tablist" aria-label="Категории">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === tab.key}
                  className={`${styles["catalog__tab"]} ${selectedCategory === tab.key ? styles["catalog__tab--active"] : ""}`}
                  onClick={() => setCategoryFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isEmpty ? (
              <p className={styles["catalog__empty"]}>По данному запросу товаров не найдено</p>
            ) : (
              <div className={styles["catalog__grid"]}>
                {pagedItems.map((item) => (
                  <article key={item.id} className={styles.card}>
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      className={styles["card__media"]}
                      aria-label={`Открыть страницу товара ${item.name}`}
                    >
                      <img className={styles["card__image"]} src={item.image} alt={item.name} />
                      <button
                        type="button"
                        className={`${styles["card__fav"]} ${isFavorite(item.id) ? styles["card__fav--active"] : ""}`}
                        aria-label={isFavorite(item.id) ? "Убрать из избранного" : "В избранное"}
                        aria-pressed={isFavorite(item.id)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                      >
                        <span className={styles["card__fav-bg"]} aria-hidden="true" />
                        <svg
                          className={styles["card__fav-icon"]}
                          width="25"
                          height="22"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M34.7333 7.68332C33.8821 6.83166 32.8714 6.15607 31.7589 5.69513C30.6465 5.23419 29.4541 4.99695 28.25 4.99695C27.0459 4.99695 25.8535 5.23419 24.7411 5.69513C23.6286 6.15607 22.6179 6.83166 21.7667 7.68332L20 9.44999L18.2333 7.68332C16.5138 5.96384 14.1817 4.99784 11.75 4.99784C9.31827 4.99784 6.98615 5.96384 5.26666 7.68332C3.54717 9.40281 2.58118 11.7349 2.58118 14.1667C2.58118 16.5984 3.54717 18.9305 5.26666 20.65L20 35.3833L34.7333 20.65C35.585 19.7987 36.2606 18.788 36.7215 17.6756C37.1825 16.5632 37.4197 15.3708 37.4197 14.1667C37.4197 12.9625 37.1825 11.7702 36.7215 10.6577C36.2606 9.5453 35.585 8.53458 34.7333 7.68332Z"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </Link>
                    <div className={styles["card__body"]}>
                      <Link
                        to="/product/$slug"
                        params={{ slug: item.slug }}
                        className={styles["card__header-row"]}
                      >
                        <h3 className={styles["card__name"]}>{item.name}</h3>
                        <span className={styles["card__badge"]}>{item.badge}</span>
                      </Link>
                      <p className={styles["card__description"]}>{item.shortDescription}</p>
                      <div className={styles["card__footer"]}>
                        <p className={styles["card__price"]}>{formatPrice(item.priceBYN)}</p>
                        <button
                          type="button"
                          className={`${styles["card__cart"]} ${isInCart(item.id) ? styles["card__cart--added"] : ""}`}
                          aria-label={isInCart(item.id) ? "Убрать из корзины" : "В корзину"}
                          aria-pressed={isInCart(item.id)}
                          onClick={() => onToggleCart(item.id)}
                        >
                          {isInCart(item.id) ? (
                            <svg className={styles["card__cart-icon"]} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg className={styles["card__cart-icon"]} width="20" height="20" viewBox="0 0 37 36" fill="none" aria-hidden="true">
                              <path
                                d="M1.54163 1.5H7.70829L11.84 21.585C11.9809 22.2756 12.3671 22.8959 12.9308 23.3374C13.4944 23.779 14.1998 24.0135 14.9233 24H29.9083C30.6318 24.0135 31.3371 23.779 31.9008 23.3374C32.4645 22.8959 32.8506 22.2756 32.9916 21.585L35.4583 9H9.24996M15.4166 31.5C15.4166 32.3284 14.7264 33 13.875 33C13.0235 33 12.3333 32.3284 12.3333 31.5C12.3333 30.6716 13.0235 30 13.875 30C14.7264 30 15.4166 30.6716 15.4166 31.5ZM32.375 31.5C32.375 32.3284 31.6847 33 30.8333 33C29.9819 33 29.2916 32.3284 29.2916 31.5C29.2916 30.6716 29.9819 30 30.8333 30C31.6847 30 32.375 30.6716 32.375 31.5Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!isEmpty && totalPages > 1 ? (
              <nav className={styles["catalog__pagination"]} aria-label="Страницы каталога">
                <button
                  type="button"
                  className={styles["pagination__arrow"]}
                  aria-label="Предыдущая страница"
                  disabled={currentPage <= 1}
                  onClick={() => goPage(currentPage - 1)}
                >
                  <svg width="11" height="19" viewBox="0 0 11 19" fill="none" aria-hidden="true">
                    <path d="M9.5 1.5L2 9.5L9.5 17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className={styles["pagination__pages"]}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles["pagination__page"]} ${currentPage === p ? styles["pagination__page--active"] : ""}`}
                      onClick={() => goPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles["pagination__arrow"]}
                  aria-label="Следующая страница"
                  disabled={currentPage >= totalPages}
                  onClick={() => goPage(currentPage + 1)}
                >
                  <svg width="11" height="19" viewBox="0 0 11 19" fill="none" aria-hidden="true">
                    <path d="M1.5 1.5L9 9.5L1.5 17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </nav>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
};