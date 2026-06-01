import { useState, type FormEvent } from "react";
import { validateEmail, validateFullName, validateMessage } from "../../../auth/validation";
import iconAddress from "../../../assets/img/contacts/Icon1.svg?raw";
import iconPhone from "../../../assets/img/contacts/Icon2.svg?raw";
import iconEmail from "../../../assets/img/contacts/Icon3.svg?raw";
import iconShare from "../../../assets/img/contacts/Icon4.svg?raw";
import { SuccessModal } from "../../ui/success-modal";
import styles from "./Contacts.module.css";

export const ContactsPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    message?: string;
  }>({});

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errFullName = validateFullName(fullName);
    const errEmail = validateEmail(email);
    const errMessage = validateMessage(message);
    const next: typeof fieldErrors = {};
    if (errFullName) next.fullName = errFullName;
    if (errEmail) next.email = errEmail;
    if (errMessage) next.message = errMessage;
    setFieldErrors(next);
    if (errFullName || errEmail || errMessage) return;
    setShowSuccess(true);
    setFullName("");
    setEmail("");
    setMessage("");
    setFieldErrors({});
  };

  const onShare = async () => {
    const shareData = {
      title: "AERO Store",
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
    } catch {}
  };

  return (
    <main className="page__content">
      <section className={styles.contacts}>
        <h1 className={styles["contacts__title"]}>Контакты</h1>

        <div className={styles["contacts__layout"]}>
          <div className={styles["contacts__info"]}>
            <article className={styles["contacts__block"]}>
              <div className={styles["contacts__block-head"]}>
                <span
                  className={styles["contacts__block-icon"]}
                  dangerouslySetInnerHTML={{ __html: iconAddress }}
                  aria-hidden="true"
                />
                <p className={styles["contacts__label"]}>Адрес</p>
              </div>
              <p className={styles["contacts__value"]}>Минск, ул. Немига, 28</p>
              <p className={styles["contacts__hint"]}>Пн-Пт: 10:00 — 20:00</p>
              <p className={styles["contacts__hint"]}>Сб-Вс: 11:00 — 18:00</p>
            </article>

            <article className={styles["contacts__block"]}>
              <div className={styles["contacts__block-head"]}>
                <span
                  className={styles["contacts__block-icon"]}
                  dangerouslySetInnerHTML={{ __html: iconPhone }}
                  aria-hidden="true"
                />
                <p className={styles["contacts__label"]}>Телефон</p>
              </div>
              <a className={styles["contacts__value"]} href="tel:+375291234567">
                +375 (29) 123-45-67
              </a>
              <button type="button" className={styles["contacts__link-btn"]}>
                Заказать обратный звонок
              </button>
            </article>

            <article className={styles["contacts__block"]}>
              <div className={styles["contacts__block-head"]}>
                <span
                  className={styles["contacts__block-icon"]}
                  dangerouslySetInnerHTML={{ __html: iconEmail }}
                  aria-hidden="true"
                />
                <p className={styles["contacts__label"]}>Email</p>
              </div>
              <a className={styles["contacts__value"]} href="mailto:info@aerostore.info">
                info@aerostore.info
              </a>
              <p className={styles["contacts__hint"]}>Отвечаем в течение 30 минут</p>
            </article>

            <button
              type="button"
              className={styles["contacts__share-btn"]}
              onClick={onShare}
              aria-label="Поделиться"
            >
              <span
                className={styles["contacts__share-icon"]}
                dangerouslySetInnerHTML={{ __html: iconShare }}
                aria-hidden="true"
              />
            </button>
          </div>

          <form className={styles["contacts__form"]} onSubmit={onSubmit} noValidate>
            <h2 className={styles["contacts__form-title"]}>Напишите нам</h2>

            <div className={styles["contacts__field"]}>
              <label className={styles["contacts__field-label"]} htmlFor="contacts-fullname">
                ФИО
              </label>
              <input
                id="contacts-fullname"
                type="text"
                className={`${styles["contacts__input"]} ${
                  fieldErrors.fullName ? styles["contacts__input--error"] : ""
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
                <p className={styles["contacts__error"]}>{fieldErrors.fullName}</p>
              ) : null}
            </div>

            <div className={styles["contacts__field"]}>
              <label className={styles["contacts__field-label"]} htmlFor="contacts-email">
                Email
              </label>
              <input
                id="contacts-email"
                type="email"
                className={`${styles["contacts__input"]} ${
                  fieldErrors.email ? styles["contacts__input--error"] : ""
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
                <p className={styles["contacts__error"]}>{fieldErrors.email}</p>
              ) : null}
            </div>

            <div className={styles["contacts__field"]}>
              <label className={styles["contacts__field-label"]} htmlFor="contacts-message">
                Сообщение
              </label>
              <textarea
                id="contacts-message"
                className={`${styles["contacts__input"]} ${styles["contacts__textarea"]} ${
                  fieldErrors.message ? styles["contacts__input--error"] : ""
                }`}
                placeholder="Чем мы можем вам помочь?"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (fieldErrors.message) {
                    setFieldErrors((p) => ({ ...p, message: undefined }));
                  }
                }}
                aria-invalid={fieldErrors.message ? true : undefined}
              />
              {fieldErrors.message ? (
                <p className={styles["contacts__error"]}>{fieldErrors.message}</p>
              ) : null}
            </div>

            <button type="submit" className={styles["contacts__submit"]}>
              Отправить сообщение
            </button>
          </form>
        </div>
      </section>

      <SuccessModal
        open={showSuccess}
        title="Сообщение отправлено"
        titleId="contacts-sent-title"
        onClose={() => setShowSuccess(false)}
      />
    </main>
  );
};
