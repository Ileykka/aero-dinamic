import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useRequireAuth } from "../../../auth/useRequireAuth";
import { useCart } from "../../../cart/CartContext";
import { useFavorites } from "../../../favorites/FavoritesContext";
import type { BriefIcon } from "../../../catalog/products";
import products, { getCardImage, getPageImages, getProductBySlug } from "../../../catalog/products";
import briefIconCamera from "../../../assets/img/product_page/icons/brief-camera.svg?raw";
import briefIconFlight from "../../../assets/img/product_page/icons/brief-flight.svg?raw";
import briefIconDistance from "../../../assets/img/product_page/icons/brief-distance.svg?raw";
import briefIconVideo from "../../../assets/img/product_page/icons/brief-video.svg?raw";
import { formatPrice } from "../../../lib/formatPrice";
import styles from "./ProductPage.module.css";

const BRIEF_ICON_SVG: Record<BriefIcon, string> = {
  camera: briefIconCamera,
  flight: briefIconFlight,
  distance: briefIconDistance,
  video: briefIconVideo,
};

const CATEGORY_LABELS: Record<string, string> = {
  drones: "Дроны",
  cameras: "Камеры",
  accessories: "Аксессуары",
  microphones: "Микрофоны",
};

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const ProductPage = () => {
  const { slug } = useParams({ strict: false }) as { slug: string };

  const product = useMemo(() => getProductBySlug(slug), [slug]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { requireAuth } = useRequireAuth();
  const { isInCart, toggleCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIdx(0);
  }, [slug]);

  const favorite = product ? isFavorite(product.id) : false;

  const inCart = product ? isInCart(product.id) : false;

  const images = useMemo(() => (product ? getPageImages(product) : []), [product]);

  const recommended = useMemo(() => {
    if (!product) return [];
    return shuffle(products.filter((p) => p.slug !== product.slug)).slice(0, 4);
  }, [product]);

  const techColumns = useMemo(() => {
    if (!product) return [[], []] as const;
    const specs = product.techSpecs;
    const mid = Math.ceil(specs.length / 2);
    return [specs.slice(0, mid), specs.slice(mid)] as const;
  }, [product]);

  if (!product) {
    return (
      <main className="page__content">
        <section className={styles.product}>
          <h1 className={styles["info__title"]}>Товар не найден</h1>
          <Link to="/catalog" className={styles["breadcrumbs__link"]}>
            Вернуться в каталог
          </Link>
        </section>
      </main>
    );
  }

  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;

  return (
    <main className="page__content">
      <section className={styles.product}>
        <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
          <Link to="/" className={styles["breadcrumbs__link"]}>
            Главная
          </Link>
          <span className={styles["breadcrumbs__separator"]}>/</span>
          <Link
            to="/catalog"
            className={styles["breadcrumbs__link"]}
          >
            Каталог
          </Link>
          <span className={styles["breadcrumbs__separator"]}>/</span>
          <Link
            to="/catalog"
            search={{ category: product.category }}
            className={styles["breadcrumbs__link"]}
          >
            {categoryLabel}
          </Link>
          <span className={styles["breadcrumbs__separator"]}>/</span>
          <span className={styles["breadcrumbs__current"]}>{product.name}</span>
        </nav>

        <div className={styles["main-grid"]}>
          <div className={styles.gallery}>
            <div className={styles["gallery__main"]}>
              <img
                className={styles["gallery__main-image"]}
                src={images[activeImageIdx] ?? images[0]}
                alt={`${product.name} — изображение ${activeImageIdx + 1}`}
              />
            </div>
            <div className={styles["gallery__thumbs"]}>
              {images.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles["gallery__thumb"]} ${
                    activeImageIdx === idx ? styles["gallery__thumb--active"] : ""
                  }`}
                  aria-label={`Показать изображение ${idx + 1}`}
                  aria-pressed={activeImageIdx === idx}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <img
                    className={styles["gallery__thumb-image"]}
                    src={src}
                    alt={`${product.name} — миниатюра ${idx + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <span className={styles["info__brand"]}>{product.brand}</span>
            <h1 className={styles["info__title"]}>{product.name}</h1>
            <p className={styles["info__price"]}>{formatPrice(product.priceBYN)}</p>
            <p className={styles["info__description"]}>{product.longDescription}</p>

            <div className={styles["info__actions"]}>
              <button
                type="button"
                className={`${styles["info__cart"]} ${inCart ? styles["info__cart--added"] : ""}`}
                onClick={() => requireAuth(() => product && toggleCart(product.id))}
              >
                {inCart ? "В корзине" : "Добавить в корзину"}
              </button>
              <button
                type="button"
                className={`${styles["info__fav"]} ${favorite ? styles["info__fav--active"] : ""}`}
                aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
                aria-pressed={favorite}
                onClick={() => requireAuth(() => product && toggleFavorite(product.id))}
              >
                <svg
                  className={styles["info__fav-icon"]}
                  width="25"
                  height="22"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M34.7333 7.68332C33.8821 6.83166 32.8714 6.15607 31.7589 5.69513C30.6465 5.23419 29.4541 4.99695 28.25 4.99695C27.0459 4.99695 25.8535 5.23419 24.7411 5.69513C23.6286 6.15607 22.6179 6.83166 21.7667 7.68332L20 9.44999L18.2333 7.68332C16.5138 5.96384 14.1817 4.99784 11.75 4.99784C9.31827 4.99784 6.98615 5.96384 5.26666 7.68332C3.54717 9.40281 2.58118 11.7349 2.58118 14.1667C2.58118 16.5984 3.54717 18.9305 5.26666 20.65L20 35.3833L34.7333 20.65C35.585 19.7987 36.2606 18.788 36.7215 17.6756C37.1825 16.5632 37.4197 15.3708 37.4197 14.1667C37.4197 12.9625 37.1825 11.7702 36.7215 10.6577C36.2606 9.5453 35.585 8.53458 34.7333 7.68332Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className={styles["info__brief"]}>
              <ul className={styles["info__brief-grid"]}>
                {product.briefSpecs.map((spec, idx) => (
                  <li key={`brief-${idx}`} className={styles["info__brief-cell"]}>
                    <span
                      className={`${styles["info__brief-icon"]} ${styles["info__brief-icon--spec"]}`}
                      aria-hidden="true"
                      dangerouslySetInnerHTML={{ __html: BRIEF_ICON_SVG[spec.icon] }}
                    />
                    <div className={styles["info__brief-text"]}>
                      <span className={styles["info__brief-label"]}>{spec.label}</span>
                      <span className={styles["info__brief-value"]}>{spec.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.tech}>
          <h2 className={styles["tech__title"]}>Технические характеристики</h2>
          <div className={styles["tech__panel"]}>
            {techColumns.map((col, colIdx) => (
              <div key={colIdx} className={styles["tech__col"]}>
                {col.map((spec, rowIdx) => (
                  <div key={`${colIdx}-${rowIdx}-${spec.label}`} className={styles["tech__row"]}>
                    <span className={styles["tech__label"]}>{spec.label}</span>
                    <span className={styles["tech__value"]}>{spec.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.related}>
          <h2 className={styles["related__title"]}>Рекомендуемые товары</h2>
          <div className={styles["related__grid"]}>
            {recommended.map((p) => (
              <Link
                key={p.slug}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className={styles["related__card"]}
              >
                <div className={styles["related__media"]}>
                  <img className={styles["related__image"]} src={getCardImage(p)} alt={p.name} />
                </div>
                <div className={styles["related__body"]}>
                  <div className={styles["related__row"]}>
                    <h3 className={styles["related__name"]}>{p.name}</h3>
                    <span className={styles["related__badge"]}>{p.badge}</span>
                  </div>
                  <p className={styles["related__description"]}>{p.shortDescription}</p>
                  <p className={styles["related__price"]}>{formatPrice(p.priceBYN)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
