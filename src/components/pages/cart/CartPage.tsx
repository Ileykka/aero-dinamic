import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRequireAuth } from "../../../auth/useRequireAuth";
import deliveryIcon from "../../../assets/img/cart/delivery.svg?raw";
import guaranteeIcon from "../../../assets/img/cart/sucess.svg?raw";
import lockIcon from "../../../assets/img/cart/lock.svg?raw";
import trashIcon from "../../../assets/img/cart/trash.svg?raw";
import { useCart } from "../../../cart/CartContext";
import { getCardImage } from "../../../catalog/products";
import { formatPrice } from "../../../lib/formatPrice";
import styles from "./Cart.module.css";

const FEATURE_ITEMS = [
  { icon: guaranteeIcon, text: "Гарантия лучшей цены AERO" },
  { icon: deliveryIcon, text: "Доставка по всей Беларуси (2–5 дней)" },
  { icon: lockIcon, text: "Безопасная оплата картой или QR" },
] as const;

export const CartPage = () => {
  const { isAuthed } = useRequireAuth();
  const navigate = useNavigate();
  const { entries, itemCount, subtotal, discount, applyPromo, clearPromo, removeFromCart, setQuantity } =
    useCart();
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (!isAuthed) {
      navigate({ to: "/register" });
      return;
    }
    window.scrollTo(0, 0);
  }, [isAuthed, navigate]);

  const total = Math.max(0, subtotal - discount);

  const onApplyPromo = () => {
    applyPromo(promoCode);
  };

  const onCheckout = () => {
    navigate({ to: "/checkout" });
  };

  if (!isAuthed) return null;

  return (
    <main className="page__content">
      <section className={styles.cart}>
        <h1 className={styles["cart__title"]}>Корзина</h1>

        {entries.length === 0 ? (
          <div className={styles["cart__empty"]}>
            <p className={styles["cart__empty-text"]}>В корзине пока нет товаров.</p>
            <Link to="/catalog" className={styles["cart__empty-link"]}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className={styles["cart__layout"]}>
            <div className={styles["cart__list"]}>
              {entries.map((entry) => {
                const image = getCardImage(entry.product);
                const subtitle = entry.product.briefSpecs.map((s) => s.value).join(", ");

                return (
                  <article key={entry.product.id} className={styles["cart__item"]}>
                    <Link
                      to="/product/$slug"
                      params={{ slug: entry.product.slug }}
                      className={styles["cart__item-media"]}
                    >
                      {image ? (
                        <img
                          className={styles["cart__item-image"]}
                          src={image}
                          alt={entry.product.name}
                        />
                      ) : null}
                    </Link>

                    <div className={styles["cart__item-content"]}>
                      <div className={styles["cart__item-head"]}>
                        <div className={styles["cart__item-info"]}>
                          <Link
                            to="/product/$slug"
                            params={{ slug: entry.product.slug }}
                            className={styles["cart__item-name"]}
                          >
                            {entry.product.name}
                          </Link>
                          <p className={styles["cart__item-subtitle"]}>{subtitle}</p>
                        </div>
                        <button
                          type="button"
                          className={styles["cart__item-remove"]}
                          aria-label="Удалить из корзины"
                          onClick={() => removeFromCart(entry.product.id)}
                        >
                          <span
                            className={styles["cart__item-remove-icon"]}
                            aria-hidden="true"
                            dangerouslySetInnerHTML={{ __html: trashIcon }}
                          />
                        </button>
                      </div>

                      <div className={styles["cart__item-foot"]}>
                        <div className={styles["cart__qty"]} aria-label="Количество">
                          <button
                            type="button"
                            className={styles["cart__qty-btn"]}
                            aria-label="Уменьшить количество"
                            disabled={entry.quantity <= 1}
                            onClick={() => setQuantity(entry.product.id, entry.quantity - 1)}
                          >
                            −
                          </button>
                          <span className={styles["cart__qty-value"]}>{entry.quantity}</span>
                          <button
                            type="button"
                            className={styles["cart__qty-btn"]}
                            aria-label="Увеличить количество"
                            onClick={() => setQuantity(entry.product.id, entry.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className={styles["cart__item-price-col"]}>
                          <p className={styles["cart__item-price"]}>{formatPrice(entry.lineTotal)}</p>
                          {entry.quantity > 1 ? (
                            <p className={styles["cart__item-unit"]}>{formatPrice(entry.product.priceBYN)} / шт.</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className={styles["cart__aside"]}>
              <div className={styles["cart__summary"]}>
                <h2 className={styles["cart__summary-title"]}>Итого</h2>

                <div className={styles["cart__summary-rows"]}>
                  <div className={styles["cart__summary-row"]}>
                    <span className={styles["cart__summary-label"]}>Товары ({itemCount})</span>
                    <span className={styles["cart__summary-value"]}>{formatPrice(subtotal)}</span>
                  </div>
                  <div className={styles["cart__summary-row"]}>
                    <span className={styles["cart__summary-label"]}>Доставка</span>
                    <span className={styles["cart__summary-value"]}>Бесплатно</span>
                  </div>
                  <div className={styles["cart__summary-row"]}>
                    <span className={styles["cart__summary-label"]}>Скидка</span>
                    {discount > 0 ? (
                      <span className={styles["cart__summary-value"]}>−{formatPrice(discount)}</span>
                    ) : null}
                  </div>
                </div>

                <hr className={styles["cart__summary-divider"]} />

                <div className={styles["cart__summary-total"]}>
                  <span className={styles["cart__summary-total-label"]}>К оплате</span>
                  <span className={styles["cart__summary-total-value"]}>{formatPrice(total)}</span>
                </div>

                <button type="button" className={styles["cart__checkout"]} onClick={onCheckout}>
                  Оформить заказ
                </button>

                <ul className={styles["cart__features"]}>
                  {FEATURE_ITEMS.map((item) => (
                    <li key={item.text} className={styles["cart__feature"]}>
                      <span
                        className={styles["cart__feature-icon"]}
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: item.icon }}
                      />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles["cart__promo"]}>
                <h3 className={styles["cart__promo-title"]}>У вас есть промокод?</h3>
                <div className={styles["cart__promo-row"]}>
                  <input
                    type="text"
                    className={styles["cart__promo-input"]}
                    placeholder="Введите код"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      clearPromo();
                    }}
                  />
                  <button type="button" className={styles["cart__promo-btn"]} onClick={onApplyPromo}>
                    Применить
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
};
