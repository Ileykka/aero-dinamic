import { Link } from "@tanstack/react-router";
import styles from "./Footer.module.css"
import logo from "../../../assets/img/main/logo.svg";
import logoDark from "../../../assets/img/main/logo-dark.svg";
import { useTheme } from "../../../theme/ThemeContext";
import instagram from "../../../assets/img/main/instagram.svg";
import vk from "../../../assets/img/main/vk.svg";
import telegram from "../../../assets/img/main/telegram.svg";
import pay1 from "../../../assets/img/main/pay1.png";
import pay2 from "../../../assets/img/main/pay2.png";
import pay3 from "../../../assets/img/main/pay3.png";
import pay4 from "../../../assets/img/main/pay4.png";
import { ThemeToggle } from "./ThemeToggle";

export const Footer = () => {
    const { theme } = useTheme();

    return (
        <footer className={styles["site-footer"]}>
            <div className={styles["site-footer__brand"]}>
                <Link to="/" className={styles["site-footer__logo"]} aria-label="AERO Store">
                    <img className={styles["site-footer__logo-image"]} src={theme === "light" ? logoDark : logo} alt="AERO Store" />
                </Link>
                <address className={styles["site-footer__contacts"]}>
                    <a className={styles["site-footer__contacts-primary"]} href="tel:+375291234567">
                        +375(29)123-45-67
                    </a>
                    <a className={styles["site-footer__contacts-secondary"]} href="mailto:info@aerostore.info">
                        info@aerostore.info
                    </a>
                    <span className={styles["site-footer__contacts-secondary"]}>220076, Минск, ул. Набережная, 9</span>
                    <span className={styles["site-footer__contacts-secondary"]}>© 2026 AERO STORE</span>
                </address>
                <div className={styles["site-footer__social"]}>
                    <a className={styles["site-footer__social-link"]} href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                        <img className={styles["site-footer__social-icon"]} src={instagram} alt="" />
                    </a>
                    <a className={styles["site-footer__social-link"]} href="https://vk.com/" target="_blank" rel="noreferrer" aria-label="VK">
                        <img className={styles["site-footer__social-icon"]} src={vk} alt="" />
                    </a>
                    <a className={styles["site-footer__social-link"]} href="https://t.me/" target="_blank" rel="noreferrer" aria-label="Telegram">
                        <img className={styles["site-footer__social-icon"]} src={telegram} alt="" />
                    </a>
                </div>
            </div>
            <nav className={styles["site-footer__menu"]}>
                <section className={styles["site-footer__column"]}>
                    <h2 className={styles["site-footer__title"]}>Каталог</h2>
                    <ul className={styles["site-footer__list"]}>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/catalog" search={{ category: "drones" }} className={styles["site-footer__list-link"]}>
                                Дроны
                            </Link>
                        </li>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/catalog" search={{ category: "cameras" }} className={styles["site-footer__list-link"]}>
                                Экшн-камеры
                            </Link>
                        </li>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/catalog" search={{ category: "microphones" }} className={styles["site-footer__list-link"]}>
                                Микрофоны
                            </Link>
                        </li>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/catalog" search={{ category: "accessories" }} className={styles["site-footer__list-link"]}>
                                Аксессуары
                            </Link>
                        </li>
                    </ul>
                </section>
                <section className={styles["site-footer__column"]}>
                    <h2 className={styles["site-footer__title"]}>Как купить</h2>
                    <ul className={styles["site-footer__list"]}>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/contacts" className={styles["site-footer__list-link"]}>
                                Адреса
                            </Link>
                        </li>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/delivery" hash="delivery-payments" className={styles["site-footer__list-link"]}>
                                Способы оплаты
                            </Link>
                        </li>
                    </ul>
                </section>
                <section className={styles["site-footer__column"]}>
                    <h2 className={styles["site-footer__title"]}>Полезно</h2>
                    <ul className={styles["site-footer__list"]}>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/favorites" className={styles["site-footer__list-link"]}>
                                Акции и скидки
                            </Link>
                        </li>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/about" className={styles["site-footer__list-link"]}>
                                О нас
                            </Link>
                        </li>
                    </ul>
                </section>
                <section className={styles["site-footer__column"]}>
                    <h2 className={styles["site-footer__title"]}>Доставка</h2>
                    <ul className={styles["site-footer__list"]}>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/delivery" hash="delivery-payments" className={styles["site-footer__list-link"]}>
                                Способы оплаты
                            </Link>
                        </li>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/delivery" hash="delivery-methods" className={styles["site-footer__list-link"]}>
                                Способы доставки
                            </Link>
                        </li>
                        <li className={styles["site-footer__list-item"]}>
                            <Link to="/delivery" hash="delivery-pickup" className={styles["site-footer__list-link"]}>
                                Самовывоз
                            </Link>
                        </li>
                    </ul>
                </section>
                <section className={`${styles["site-footer__column"]} ${styles["site-footer__column--payments"]}`}>
                    <h2 className={styles["site-footer__title"]}>Способы оплаты</h2>
                    <div className={styles["site-footer__payments"]}>
                        <img className={styles["site-footer__payment-image"]} src={pay1} alt="Способ оплаты 1" />
                        <img className={styles["site-footer__payment-image"]} src={pay2} alt="Способ оплаты 2" />
                        <img className={styles["site-footer__payment-image"]} src={pay3} alt="Способ оплаты 3" />
                        <img className={styles["site-footer__payment-image"]} src={pay4} alt="Способ оплаты 4" />
                    </div>
                    <ThemeToggle />
                </section>
            </nav>
        </footer>
    )
}
