import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../../auth/AuthContext";
import { validateLogin, validatePassword } from "../../../auth/validation";
import styles from "./AuthPages.module.css";
import appleMark from "../../../assets/img/auth/apple.svg";
import googleMark from "../../../assets/img/auth/google.svg";
import eyeIcon from "../../../assets/img/auth/Eye.svg";
import eyeOffIcon from "../../../assets/img/auth/Eye_off.svg";


export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ login?: string; password?: string }>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isLoginRoute = location.pathname === "/login";

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    const errLogin = validateLogin(loginValue);
    const errPass = validatePassword(password);
    const next: { login?: string; password?: string } = {};
    if (errLogin) next.login = errLogin;
    if (errPass) next.password = errPass;
    setFieldErrors(next);
    if (errLogin || errPass) return;

    setSubmitting(true);
    const result = login(loginValue.trim(), password, rememberMe);
    setSubmitting(false);
    if (result.ok === false) {
      setFormError(result.error);
      return;
    }
    navigate({ to: "/" });
  };

  const onSocial = (provider: string) => {
    window.alert(`Вход через ${provider} будет доступен позже.`);
  };

  const onForgotPassword = () => {
    window.alert("Восстановление пароля будет доступно позже.");
  };

  return (
    <main className="page__content page__content--auth">
      <div className={styles.auth}>
        <div className={styles["auth__card"]}>
          <div className={styles["auth__panel"]}>
            <header className={styles["auth__heading"]}>
              <h1 className={styles["auth__titleHero"]}>Вход</h1>
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
                <label className={styles["auth__label"]} htmlFor="auth-login">
                  Логин
                </label>
                <input
                  id="auth-login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  className={`${styles["auth__input"]} ${fieldErrors.login ? styles["auth__input--error"] : ""}`}
                  value={loginValue}
                  onChange={(ev) => {
                    setLoginValue(ev.target.value);
                    if (fieldErrors.login) setFieldErrors((p) => ({ ...p, login: undefined }));
                  }}
                />
                {fieldErrors.login ? <p className={styles["auth__error"]}>{fieldErrors.login}</p> : null}
              </div>

              <div className={styles["auth__field"]}>
                <div className={styles["auth__labelRow"]}>
                  <label className={styles["auth__label"]} htmlFor="auth-password">
                    Пароль
                  </label>
                  <button type="button" className={styles["auth__forgot"]} onClick={onForgotPassword}>
                    Забыли пароль?
                  </button>
                </div>
                <span className={styles["auth__inputWrap"]}>
                  <input
                    id="auth-password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="current-password"
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

              <label className={styles["auth__remember"]}>
                <input
                  type="checkbox"
                  className={styles["auth__rememberInput"]}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={styles["auth__rememberBox"]} aria-hidden="true" />
                <span className={styles["auth__rememberText"]}>Запомнить меня</span>
              </label>

              <button type="submit" className={styles["auth__submit"]} disabled={submitting}>
                Войти в систему
              </button>
            </form>

            <div className={styles["auth__social"]}>
              <div className={styles["auth__socialDivider"]}>
                <span>ИЛИ ЧЕРЕЗ</span>
              </div>
              <div className={styles["auth__socialRow"]}>
                <button type="button" className={styles["auth__socialWide"]} onClick={() => onSocial("Google")}>
                  <img src={googleMark} alt="" className={styles["auth__socialImg"]} width={24} height={24} />
                  <span className={styles["auth__srOnly"]}>Google</span>
                </button>
                <button type="button" className={styles["auth__socialWide"]} onClick={() => onSocial("Apple")}>
                  <img src={appleMark} alt="" className={styles["auth__socialImg"]} width={24} height={24} />
                  <span className={styles["auth__srOnly"]}>Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
