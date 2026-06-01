import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../../auth/AuthContext";
import {
  validateEmail,
  validateLogin,
  validateName,
  validatePassword,
  validatePasswordConfirm,
  validatePersonalDataConsent,
  validateSurname,
} from "../../../auth/validation";
import styles from "./AuthPages.module.css";
import eyeIcon from "../../../assets/img/auth/Eye.svg";
import eyeOffIcon from "../../../assets/img/auth/Eye_off.svg";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, register } = useAuth();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    surname?: string;
    login?: string;
    email?: string;
    password?: string;
    confirm?: string;
    consent?: string;
  }>({});

  const isLoginRoute = location.pathname === "/login";

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    const errName = validateName(name);
    const errSurname = validateSurname(surname);
    const errLogin = validateLogin(loginValue);
    const errPass = validatePassword(password);
    const errConfirm = validatePasswordConfirm(password, confirm);
    const errEmail = validateEmail(email);
    const errConsent = validatePersonalDataConsent(consent);
    const next: typeof fieldErrors = {};
    if (errName) next.name = errName;
    if (errSurname) next.surname = errSurname;
    if (errLogin) next.login = errLogin;
    if (errPass) next.password = errPass;
    if (errConfirm) next.confirm = errConfirm;
    if (errEmail) next.email = errEmail;
    if (errConsent) next.consent = errConsent;
    setFieldErrors(next);
    if (errName || errSurname || errLogin || errPass || errConfirm || errEmail || errConsent) return;

    setSubmitting(true);
    const regResult = register({
      name,
      surname,
      login: loginValue.trim(),
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (regResult.ok === false) {
      const { error, field } = regResult;
      if (field === "email") {
        setFieldErrors((p) => ({ ...p, email: error }));
      } else if (field === "login") {
        setFieldErrors((p) => ({ ...p, login: error }));
      } else {
        setFormError(error);
      }
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <main className="page__content page__content--auth">
      <div className={styles.auth}>
        <div className={styles["auth__card"]}>
          <div className={styles["auth__panel"]}>
            <header className={styles["auth__heading"]}>
              <h1 className={styles["auth__titleHero"]}>Регистрация</h1>
              <p className={styles["auth__heroLead"]}>Добро пожаловать в AERO</p>
            </header>

            <nav className={styles["auth__tabs"]} aria-label="Режим авторизации">
              <Link
                to="/login"
                className={`${styles["auth__tab"]} ${isLoginRoute ? styles["auth__tab--active"] : ""}`}
                aria-current={isLoginRoute ? "page" : undefined}
              >
                Вход
              </Link>
              <Link
                to="/register"
                className={`${styles["auth__tab"]} ${!isLoginRoute ? styles["auth__tab--active"] : ""}`}
                aria-current={!isLoginRoute ? "page" : undefined}
              >
                Регистрация
              </Link>
            </nav>

            <form className={styles["auth__form"]} onSubmit={onSubmit} noValidate>
              {formError ? <p className={styles["auth__formError"]}>{formError}</p> : null}

              <div className={styles["auth__field"]}>
                <label className={styles["auth__label"]} htmlFor="reg-name">
                  Имя
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  className={`${styles["auth__input"]} ${fieldErrors.name ? styles["auth__input--error"] : ""}`}
                  value={name}
                  onChange={(ev) => {
                    setName(ev.target.value);
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                  }}
                />
                {fieldErrors.name ? <p className={styles["auth__error"]}>{fieldErrors.name}</p> : null}
              </div>

              <div className={styles["auth__field"]}>
                <label className={styles["auth__label"]} htmlFor="reg-surname">
                  Фамилия
                </label>
                <input
                  id="reg-surname"
                  name="surname"
                  type="text"
                  autoComplete="family-name"
                  className={`${styles["auth__input"]} ${fieldErrors.surname ? styles["auth__input--error"] : ""}`}
                  value={surname}
                  onChange={(ev) => {
                    setSurname(ev.target.value);
                    if (fieldErrors.surname) setFieldErrors((p) => ({ ...p, surname: undefined }));
                  }}
                />
                {fieldErrors.surname ? <p className={styles["auth__error"]}>{fieldErrors.surname}</p> : null}
              </div>

              <div className={styles["auth__field"]}>
                <label className={styles["auth__label"]} htmlFor="reg-login">
                  <span className={styles["auth__labelLine"]}>
                    Логин <span className={styles["auth__mutedHint"]}>(минимум 3 символа)</span>
                    <span className={styles["auth__mark"]} aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                <input
                  id="reg-login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  className={`${styles["auth__input"]} ${fieldErrors.login ? styles["auth__input--error"] : ""}`}
                  value={loginValue}
                  onChange={(ev) => {
                    setLoginValue(ev.target.value);
                    setFieldErrors((p) => ({ ...p, login: undefined }));
                    setFormError("");
                  }}
                />
                {fieldErrors.login ? <p className={styles["auth__error"]}>{fieldErrors.login}</p> : null}
              </div>

              <div className={styles["auth__field"]}>
                <label className={styles["auth__label"]} htmlFor="reg-password">
                  <span className={styles["auth__labelLine"]}>
                    Пароль{" "}
                    <span className={styles["auth__mutedHint"]}>(не менее 6 символов длиной)</span>
                    <span className={styles["auth__mark"]} aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                <span className={styles["auth__inputWrap"]}>
                  <input
                    id="reg-password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    className={`${styles["auth__input"]} ${passwordFocused ? styles["auth__input--withAction"] : ""} ${fieldErrors.password ? styles["auth__input--error"] : ""}`}
                    value={password}
                    onChange={(ev) => {
                      setPassword(ev.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false);
                      setPasswordVisible(false);
                    }}
                  />
                  {passwordFocused ? (
                    <button
                      type="button"
                      className={styles["auth__inputAction"]}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setPasswordVisible((v) => !v)}
                      aria-label={passwordVisible ? "Скрыть пароль" : "Показать пароль"}
                    >
                      <img
                        src={passwordVisible ? eyeOffIcon : eyeIcon}
                        alt=""
                        className={styles["auth__inputActionIcon"]}
                        width={22}
                        height={22}
                        draggable={false}
                      />
                    </button>
                  ) : null}
                </span>
                {fieldErrors.password ? <p className={styles["auth__error"]}>{fieldErrors.password}</p> : null}
              </div>

              <div className={styles["auth__field"]}>
                <label className={styles["auth__label"]} htmlFor="reg-confirm">
                  <span className={styles["auth__labelLine"]}>
                    Подтверждение пароля
                    <span className={styles["auth__mark"]} aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                <span className={styles["auth__inputWrap"]}>
                  <input
                    id="reg-confirm"
                    name="confirm"
                    type={confirmVisible ? "text" : "password"}
                    autoComplete="new-password"
                    className={`${styles["auth__input"]} ${confirmFocused ? styles["auth__input--withAction"] : ""} ${fieldErrors.confirm ? styles["auth__input--error"] : ""}`}
                    value={confirm}
                    onChange={(ev) => {
                      setConfirm(ev.target.value);
                      if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined }));
                    }}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => {
                      setConfirmFocused(false);
                      setConfirmVisible(false);
                    }}
                  />
                  {confirmFocused ? (
                    <button
                      type="button"
                      className={styles["auth__inputAction"]}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setConfirmVisible((v) => !v)}
                      aria-label={confirmVisible ? "Скрыть подтверждение пароля" : "Показать подтверждение пароля"}
                    >
                      <img
                        src={confirmVisible ? eyeOffIcon : eyeIcon}
                        alt=""
                        className={styles["auth__inputActionIcon"]}
                        width={22}
                        height={22}
                        draggable={false}
                      />
                    </button>
                  ) : null}
                </span>
                {fieldErrors.confirm ? <p className={styles["auth__error"]}>{fieldErrors.confirm}</p> : null}
              </div>

              <div className={styles["auth__field"]}>
                <label className={styles["auth__label"]} htmlFor="reg-email">
                  <span className={styles["auth__labelLine"]}>
                    Email
                    <span className={styles["auth__mark"]} aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`${styles["auth__input"]} ${fieldErrors.email ? styles["auth__input--error"] : ""}`}
                  value={email}
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    setFieldErrors((p) => ({ ...p, email: undefined }));
                    setFormError("");
                  }}
                />
                {fieldErrors.email ? <p className={styles["auth__error"]}>{fieldErrors.email}</p> : null}
              </div>

              <label className={styles["auth__consent"]}>
                <input
                  type="checkbox"
                  className={styles["auth__rememberInput"]}
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (fieldErrors.consent) setFieldErrors((p) => ({ ...p, consent: undefined }));
                  }}
                />
                <span className={styles["auth__rememberBox"]} aria-hidden="true" />
                <span className={styles["auth__consentText"]}>
                  Я даю согласие на обработку моих персональных данных
                </span>
              </label>
              {fieldErrors.consent ? <p className={styles["auth__error"]}>{fieldErrors.consent}</p> : null}

              <button type="submit" className={styles["auth__submit"]} disabled={submitting}>
                Зарегистрироваться
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
