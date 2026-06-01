import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRequireAuth } from "../../../auth/useRequireAuth";
import {
  validateEmail,
  validateFullName,
  validatePhone,
} from "../../../auth/validation";
import cardIcon from "../../../assets/img/checkout/card.svg?raw";
import cashIcon from "../../../assets/img/checkout/cash.svg?raw";
import pinIcon from "../../../assets/img/checkout/pin.svg?raw";
import qrIcon from "../../../assets/img/checkout/qr.svg?raw";
import truckIcon from "../../../assets/img/checkout/truck.svg?raw";
import { useCart } from "../../../cart/CartContext";
import { useOrders } from "../../../orders/OrdersContext";
import { getCardImage } from "../../../catalog/products";
import {
  extractPhoneDigits,
  formatPhoneFromDigits,
  getPhoneCaretIndex,
  PHONE_MAX_DIGITS,
  PHONE_PREFIX_LENGTH,
} from "../../../lib/phoneMask";
import { formatPrice } from "../../../lib/formatPrice";
import { SuccessModal } from "../../ui/success-modal";
import styles from "./Checkout.module.css";

const DELIVERY_COURIER_COST = 30;

type DeliveryId = "courier" | "pickup";
type PaymentId = "card" | "qr" | "cash";

const PAYMENT_OPTIONS: { id: PaymentId; label: string; icon: string }[] = [
  { id: "card", label: "Банковская карта", icon: cardIcon },
  { id: "qr", label: "QR-код", icon: qrIcon },
  { id: "cash", label: "При получении", icon: cashIcon },
];

type PhoneMaskVisualProps = {
  digits: string;
};

function PhoneMaskVisual({ digits }: PhoneMaskVisualProps) {
  const slot = (index: number) => digits[index] ?? "_";

  const renderGroup = (start: number, length: number) => {
    const text = Array.from({ length }, (_, i) => slot(start + i)).join("");
    return (
      <span key={start} className={styles["checkout__phone-slot"]}>
        {text}
      </span>
    );
  };

  return (
    <span className={styles["checkout__phone-mask-visual"]} aria-hidden="true">
      <span className={styles["checkout__phone-prefix"]}>+375 </span>
      {renderGroup(0, 2)}
      <span className={styles["checkout__phone-sep"]}> </span>
      {renderGroup(2, 3)}
      <span className={styles["checkout__phone-sep"]}>-</span>
      {renderGroup(5, 2)}
      <span className={styles["checkout__phone-sep"]}>-</span>
      {renderGroup(7, 2)}
    </span>
  );
}

export const CheckoutPage = () => {
  const { isAuthed } = useRequireAuth();
  const navigate = useNavigate();
  const { entries, itemCount, subtotal, discount, clearCart } = useCart();
  const { addOrderFromCheckout } = useOrders();

  const [fullName, setFullName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [delivery, setDelivery] = useState<DeliveryId>("courier");
  const [payment, setPayment] = useState<PaymentId>("card");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
  }>({});

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const phoneDisplay = formatPhoneFromDigits(phoneDigits);
  const showPhonePlaceholder = !phoneFocused && phoneDigits.length === 0;

  const placePhoneCaret = useCallback((digitCount: number) => {
    const el = phoneInputRef.current;
    if (!el) return;
    const pos = getPhoneCaretIndex(digitCount);
    el.setSelectionRange(pos, pos);
  }, []);

  const updatePhoneDigits = useCallback(
    (next: string) => {
      setPhoneDigits(next);
      requestAnimationFrame(() => placePhoneCaret(next.length));
    },
    [placePhoneCaret],
  );

  useEffect(() => {
    if (!isAuthed) {
      navigate({ to: "/register" });
      return;
    }
    if (entries.length === 0 && !showOrderSuccess) {
      navigate({ to: "/cart" });
      return;
    }
    window.scrollTo(0, 0);
  }, [isAuthed, entries.length, navigate, showOrderSuccess]);

  const step1Complete = useMemo(
    () =>
      !validateFullName(fullName) &&
      !validatePhone(phoneDigits) &&
      !validateEmail(email),
    [fullName, phoneDigits, email],
  );

  const step2Complete = step1Complete;
  const step3Complete = step2Complete;

  const deliveryCost = delivery === "courier" ? DELIVERY_COURIER_COST : 0;
  const total = Math.max(0, subtotal - discount + deliveryCost);

  const handlePhoneFocus = () => {
    setPhoneFocused(true);
    requestAnimationFrame(() => placePhoneCaret(phoneDigits.length));
  };

  const handlePhoneBlur = () => {
    setPhoneFocused(false);
  };

  const handlePhoneClick = () => {
    requestAnimationFrame(() => {
      const el = phoneInputRef.current;
      if (!el) return;
      if ((el.selectionStart ?? 0) < PHONE_PREFIX_LENGTH) {
        placePhoneCaret(phoneDigits.length);
      }
    });
  };

  const handlePhoneSelect = () => {
    requestAnimationFrame(() => {
      const el = phoneInputRef.current;
      if (!el) return;
      const min = getPhoneCaretIndex(0);
      const caret = getPhoneCaretIndex(phoneDigits.length);
      if ((el.selectionStart ?? 0) < min) {
        el.setSelectionRange(caret, caret);
      }
    });
  };

  const handlePhoneKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      if (phoneDigits.length < PHONE_MAX_DIGITS) {
        updatePhoneDigits(phoneDigits + e.key);
        if (fieldErrors.phone) {
          setFieldErrors((p) => ({ ...p, phone: undefined }));
        }
      }
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      if (phoneDigits.length > 0) {
        updatePhoneDigits(phoneDigits.slice(0, -1));
        if (fieldErrors.phone) {
          setFieldErrors((p) => ({ ...p, phone: undefined }));
        }
      }
      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();
      return;
    }

    if (
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    updatePhoneDigits(extractPhoneDigits(e.target.value));
    if (fieldErrors.phone) {
      setFieldErrors((p) => ({ ...p, phone: undefined }));
    }
  };

  const handlePhonePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    updatePhoneDigits(extractPhoneDigits(e.clipboardData.getData("text")));
    if (fieldErrors.phone) {
      setFieldErrors((p) => ({ ...p, phone: undefined }));
    }
  };

  const onSubmitOrder = () => {
    const errFullName = validateFullName(fullName);
    const errPhone = validatePhone(phoneDigits);
    const errEmail = validateEmail(email);
    const next: typeof fieldErrors = {};
    if (errFullName) next.fullName = errFullName;
    if (errPhone) next.phone = errPhone;
    if (errEmail) next.email = errEmail;
    setFieldErrors(next);
    if (errFullName || errPhone || errEmail) return;
    addOrderFromCheckout({ entries: [...entries], totalByn: total });
    clearCart();
    setShowOrderSuccess(true);
  };

  const closeOrderSuccess = () => {
    setShowOrderSuccess(false);
    navigate({ to: "/" });
  };

  if (!isAuthed || (entries.length === 0 && !showOrderSuccess)) return null;

  return (
    <main className="page__content">
      {!showOrderSuccess ? (
      <section className={styles.checkout}>
        <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
          <Link to="/" className={styles["breadcrumbs__link"]}>
            Главная
          </Link>
          <span className={styles["breadcrumbs__separator"]}>/</span>
          <Link to="/cart" className={styles["breadcrumbs__link"]}>
            Корзина
          </Link>
          <span className={styles["breadcrumbs__separator"]}>/</span>
          <span className={styles["breadcrumbs__current"]}>Оформление заказа</span>
        </nav>

        <h1 className={styles["checkout__title"]}>Оформление заказа</h1>

        <div className={styles["checkout__layout"]}>
          <div className={styles["checkout__form"]}>
            <section className={styles["checkout__step"]}>
              <div className={styles["checkout__step-head"]}>
                <span
                  className={`${styles["checkout__step-badge"]} ${
                    step1Complete ? styles["checkout__step-badge--active"] : ""
                  }`}
                >
                  1
                </span>
                <h2 className={styles["checkout__step-title"]}>Личные данные</h2>
              </div>

              <div className={styles["checkout__fields"]}>
                <div className={styles["checkout__fields-row"]}>
                  <div className={styles["checkout__field"]}>
                    <label className={styles["checkout__label"]} htmlFor="checkout-fullname">
                      ФИО
                    </label>
                    <input
                      id="checkout-fullname"
                      type="text"
                      className={`${styles["checkout__input"]} ${
                        fieldErrors.fullName ? styles["checkout__input--error"] : ""
                      }`}
                      placeholder="Иванов Иван Иванович"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors((p) => ({ ...p, fullName: undefined }));
                        }
                      }}
                      autoComplete="name"
                      aria-invalid={fieldErrors.fullName ? true : undefined}
                    />
                    {fieldErrors.fullName ? (
                      <p className={styles["checkout__error"]}>{fieldErrors.fullName}</p>
                    ) : null}
                  </div>
                  <div className={`${styles["checkout__field"]} ${styles["checkout__field--phone"]}`}>
                    <span className={styles["checkout__label"]}>Телефон</span>
                    <div
                      className={`${styles["checkout__phone-stack"]} ${
                        fieldErrors.phone ? styles["checkout__phone-stack--error"] : ""
                      }`}
                    >
                      {showPhonePlaceholder ? (
                        <span className={styles["checkout__phone-placeholder"]} aria-hidden="true">
                          +375 __ ___-__-__
                        </span>
                      ) : (
                        <PhoneMaskVisual digits={phoneDigits} />
                      )}
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        className={`${styles["checkout__phone-input"]} ${
                          showPhonePlaceholder
                            ? styles["checkout__phone-input--overlay"]
                            : styles["checkout__phone-input--mask"]
                        }`}
                        inputMode="numeric"
                        autoComplete="off"
                        value={showPhonePlaceholder ? "" : phoneDisplay}
                        onChange={handlePhoneChange}
                        onKeyDown={handlePhoneKeyDown}
                        onPaste={handlePhonePaste}
                        onFocus={handlePhoneFocus}
                        onBlur={handlePhoneBlur}
                        onClick={handlePhoneClick}
                        onSelect={handlePhoneSelect}
                        aria-label="Телефон"
                        aria-invalid={fieldErrors.phone ? true : undefined}
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <p className={styles["checkout__error"]}>{fieldErrors.phone}</p>
                    ) : null}
                  </div>
                </div>
                <div className={styles["checkout__field"]}>
                  <label className={styles["checkout__label"]} htmlFor="checkout-email">
                    Электронная почта
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    className={`${styles["checkout__input"]} ${
                      fieldErrors.email ? styles["checkout__input--error"] : ""
                    }`}
                    placeholder="example@aero.pro"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((p) => ({ ...p, email: undefined }));
                      }
                    }}
                    autoComplete="email"
                    aria-invalid={fieldErrors.email ? true : undefined}
                  />
                  {fieldErrors.email ? (
                    <p className={styles["checkout__error"]}>{fieldErrors.email}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className={styles["checkout__step"]}>
              <div className={styles["checkout__step-head"]}>
                <span
                  className={`${styles["checkout__step-badge"]} ${
                    step2Complete ? styles["checkout__step-badge--active"] : ""
                  }`}
                >
                  2
                </span>
                <h2 className={styles["checkout__step-title"]}>Способ доставки</h2>
              </div>

              <div className={styles["checkout__delivery-grid"]}>
                <button
                  type="button"
                  className={`${styles["checkout__option-card"]} ${
                    delivery === "courier" ? styles["checkout__option-card--selected"] : ""
                  }`}
                  onClick={() => setDelivery("courier")}
                  aria-pressed={delivery === "courier"}
                >
                  <span className={styles["checkout__radio"]} aria-hidden="true" />
                  <span
                    className={styles["checkout__option-icon"]}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: truckIcon }}
                  />
                  <p className={styles["checkout__option-title"]}>Курьерская доставка</p>
                  <p className={styles["checkout__option-subtitle"]}>До двери, 1–2 рабочих дня</p>
                  <p className={styles["checkout__option-price"]}>{formatPrice(DELIVERY_COURIER_COST)}</p>
                </button>

                <button
                  type="button"
                  className={`${styles["checkout__option-card"]} ${
                    delivery === "pickup" ? styles["checkout__option-card--selected"] : ""
                  }`}
                  onClick={() => setDelivery("pickup")}
                  aria-pressed={delivery === "pickup"}
                >
                  <span className={styles["checkout__radio"]} aria-hidden="true" />
                  <span
                    className={styles["checkout__option-icon"]}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: pinIcon }}
                  />
                  <p className={styles["checkout__option-title"]}>Самовывоз</p>
                  <p className={styles["checkout__option-subtitle"]}>Пункт выдачи AERO Store</p>
                  <p className={styles["checkout__option-price"]}>Бесплатно</p>
                </button>
              </div>
            </section>

            <section className={styles["checkout__step"]}>
              <div className={styles["checkout__step-head"]}>
                <span
                  className={`${styles["checkout__step-badge"]} ${
                    step3Complete ? styles["checkout__step-badge--active"] : ""
                  }`}
                >
                  3
                </span>
                <h2 className={styles["checkout__step-title"]}>Способ оплаты</h2>
              </div>

              <div className={styles["checkout__payment-list"]}>
                {PAYMENT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles["checkout__payment-row"]} ${
                      payment === option.id ? styles["checkout__payment-row--selected"] : ""
                    }`}
                    onClick={() => setPayment(option.id)}
                    aria-pressed={payment === option.id}
                  >
                    <span className={styles["checkout__radio"]} aria-hidden="true" />
                    <span
                      className={styles["checkout__payment-icon"]}
                      aria-hidden="true"
                      dangerouslySetInnerHTML={{ __html: option.icon }}
                    />
                    <span className={styles["checkout__payment-label"]}>{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles["checkout__order"]}>
            <h2 className={styles["checkout__order-title"]}>Ваш заказ</h2>

            <div className={styles["checkout__order-items"]}>
              {entries.map((entry) => {
                const image = getCardImage(entry.product);

                return (
                  <article key={entry.product.id} className={styles["checkout__order-item"]}>
                    <div className={styles["checkout__order-thumb"]}>
                      {image ? (
                        <img
                          className={styles["checkout__order-image"]}
                          src={image}
                          alt={entry.product.name}
                        />
                      ) : null}
                    </div>
                    <div className={styles["checkout__order-main"]}>
                      <p className={styles["checkout__order-name"]}>{entry.product.name}</p>
                      <p className={styles["checkout__order-meta"]}>Количество: {entry.quantity}</p>
                    </div>
                    <p className={styles["checkout__order-price"]}>{formatPrice(entry.lineTotal)}</p>
                  </article>
                );
              })}
            </div>

            <div className={styles["checkout__order-rows"]}>
              <div className={styles["checkout__order-row"]}>
                <span className={styles["checkout__order-row-label"]}>Товары ({itemCount})</span>
                <span className={styles["checkout__order-row-value"]}>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles["checkout__order-row"]}>
                <span className={styles["checkout__order-row-label"]}>Доставка</span>
                <span className={styles["checkout__order-row-value"]}>
                  {deliveryCost > 0 ? formatPrice(deliveryCost) : "Бесплатно"}
                </span>
              </div>
              <div className={styles["checkout__order-row"]}>
                <span className={styles["checkout__order-row-label"]}>Скидка</span>
                <span className={styles["checkout__order-row-value"]}>
                  {discount > 0 ? `−${formatPrice(discount)}` : "−0 BYN"}
                </span>
              </div>
            </div>

            <hr className={styles["checkout__order-divider"]} />

            <div className={styles["checkout__order-total"]}>
              <span className={styles["checkout__order-total-label"]}>ИТОГО</span>
              <span className={styles["checkout__order-total-value"]}>{formatPrice(total)}</span>
            </div>

            <button type="button" className={styles["checkout__pay-btn"]} onClick={onSubmitOrder}>
              Оформить заказ
            </button>

            <p className={styles["checkout__legal"]}>
              Нажимая кнопку, вы соглашаетесь с{" "}
              <a className={styles["checkout__legal-link"]} href="#">
                условиями обслуживания
              </a>{" "}
              и{" "}
              <a className={styles["checkout__legal-link"]} href="#">
                политикой конфиденциальности
              </a>
              .
            </p>
          </aside>
        </div>
      </section>
      ) : null}

      <SuccessModal
        open={showOrderSuccess}
        title="Заказ оформлен"
        titleId="checkout-order-success-title"
        onClose={closeOrderSuccess}
      />
    </main>
  );
};
