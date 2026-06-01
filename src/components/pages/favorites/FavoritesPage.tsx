import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useRequireAuth } from "../../../auth/useRequireAuth";
import { getCardImage, type Product } from "../../../catalog/products";
import { useFavorites } from "../../../favorites/FavoritesContext";
import { formatPrice } from "../../../lib/formatPrice";
import { formatProductCount } from "../../../lib/formatCount";
import bannerImg from "../../../assets/img/favorites/fav-discount-image.png";
import styles from "./Favorites.module.css";

const HEART_PATH =
  "M34.7333 7.68332C33.8821 6.83166 32.8714 6.15607 31.7589 5.69513C30.6465 5.23419 29.4541 4.99695 28.25 4.99695C27.0459 4.99695 25.8535 5.23419 24.7411 5.69513C23.6286 6.15607 22.6179 6.83166 21.7667 7.68332L20 9.44999L18.2333 7.68332C16.5138 5.96384 14.1817 4.99784 11.75 4.99784C9.31827 4.99784 6.98615 5.96384 5.26666 7.68332C3.54717 9.40281 2.58118 11.7349 2.58118 14.1667C2.58118 16.5984 3.54717 18.9305 5.26666 20.65L20 35.3833L34.7333 20.65C35.585 19.7987 36.2606 18.788 36.7215 17.6756C37.1825 16.5632 37.4197 15.3708 37.4197 14.1667C37.4197 12.9625 37.1825 11.7702 36.7215 10.6577C36.2606 9.5453 35.585 8.53458 34.7333 7.68332Z";

type FavoriteItem = Product & { image: string };

function FavoriteProductCard({
  item,
  isFav,
  onRemove,
}: {
  item: FavoriteItem;
  isFav: boolean;
  onRemove: () => void;
}) {
  return (
    <article className={styles.card}>
      <Link to="/product/$slug" params={{ slug: item.slug }} className={styles["card__media"]}>
        <img className={styles["card__image"]} src={item.image} alt={item.name} />
        <button
          type="button"
          className={`${styles["card__fav"]} ${isFav ? styles["card__fav--active"] : ""}`}
          aria-label="Убрать из избранного"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
        >
          <span className={styles["card__fav-bg"]} aria-hidden="true" />
          <svg
            className={styles["card__fav-icon"]}
            width="25"
            height="22"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={HEART_PATH}
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
        <p className={styles["card__price"]}>{formatPrice(item.priceBYN)}</p>
      </div>
    </article>
  );
}

export const FavoritesPage = () => {
  const { isAuthed } = useRequireAuth();
  const navigate = useNavigate();
  const { entries, count, isFavorite, toggleFavorite } = useFavorites();
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const items = useMemo(
    () => entries.map((e) => ({ ...e.product, image: getCardImage(e.product) })),
    [entries],
  );

  const updateNavState = (swiper: SwiperInstance) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate({ to: "/register" });
      return;
    }
    window.scrollTo(0, 0);
  }, [isAuthed, navigate]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.update();
    updateNavState(swiper);
  }, [items.length]);

  if (!isAuthed) return null;

  return (
    <main className="page__content">
      <section className={styles.favorites}>
        <div className={styles["favorites__head"]}>
          <h1 className={styles["favorites__title"]}>Избранное</h1>
          {count > 0 ? (
            <span className={styles["favorites__count"]}>{formatProductCount(count)}</span>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className={styles["favorites__empty"]}>
            <p className={styles["favorites__empty-text"]}>В избранном пока нет товаров.</p>
            <Link to="/catalog" className={styles["favorites__empty-link"]}>
              Смотреть каталог
            </Link>
          </div>
        ) : (
          <>
            <div className={styles["favorites__carousel"]}>
              <button
                type="button"
                className={`${styles["favorites__arrow"]} ${styles["favorites__arrow--prev"]}`}
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={isBeginning}
                aria-label="Предыдущие товары"
              >
                <svg width="24" height="44" viewBox="0 0 24 44" fill="none" aria-hidden="true">
                  <path
                    d="M22 2L4 22L22 42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <Swiper
                className={styles["favorites__swiper"]}
                spaceBetween={24}
                slidesPerView={1}
                slidesPerGroup={1}
                speed={350}
                watchOverflow
                breakpoints={{
                  600: { slidesPerView: 2 },
                  900: { slidesPerView: 3 },
                  1200: { slidesPerView: 4 },
                }}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  updateNavState(swiper);
                }}
                onSlideChange={updateNavState}
                onResize={updateNavState}
                onBreakpoint={updateNavState}
              >
                {items.map((item) => (
                  <SwiperSlide key={item.id} className={styles["favorites__slide"]}>
                    <FavoriteProductCard
                      item={item}
                      isFav={isFavorite(item.id)}
                      onRemove={() => toggleFavorite(item.id)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                type="button"
                className={`${styles["favorites__arrow"]} ${styles["favorites__arrow--next"]}`}
                onClick={() => swiperRef.current?.slideNext()}
                disabled={isEnd}
                aria-label="Следующие товары"
              >
                <svg width="24" height="44" viewBox="0 0 24 44" fill="none" aria-hidden="true">
                  <path
                    d="M2 2L20 22L2 42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className={styles["favorites__promo-row"]}>
              <div className={styles["favorites__banner"]}>
                <img className={styles["favorites__banner-image"]} src={bannerImg} alt="" />
                <div className={styles["favorites__banner-overlay"]}>
                  <div className={styles["favorites__banner-content"]}>
                    <h2 className={styles["favorites__banner-title"]}>Создайте свой набор</h2>
                    <p className={styles["favorites__banner-text"]}>
                      Исследуйте полный каталог профессиональных аксессуаров и дронов для реализации
                      ваших самых смелых идей.
                    </p>
                    <Link to="/catalog" className={styles["favorites__banner-cta"]}>
                      Смотреть каталог
                    </Link>
                  </div>
                </div>
              </div>

              <aside className={styles["favorites__discount"]}>
                <h2 className={styles["favorites__discount-title"]}>Персональная скидка</h2>
                <p className={styles["favorites__discount-text"]}>
                  Как пользователь с избранными товарами, вы можете получить дополнительную скидку 5%
                  на первый заказ этого оборудования. Используйте промокод при оформлении.
                </p>
                <div className={styles["favorites__promo-box"]}>
                  <span className={styles["favorites__promo-code"]}>AERO_START_2026</span>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
};
