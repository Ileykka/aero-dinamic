import {
    useCallback,
    useRef,
    useState,
    type ChangeEvent,
    type ClipboardEvent,
    type FormEvent,
    type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import { SuccessModal } from "../../ui/success-modal";
import styles from "./Main.module.css"
import dronecat from "../../../assets/img/main/drone-category.png";
import cameracat from "../../../assets/img/main/camera-category.png";
import accescat from "../../../assets/img/main/acces-category.png";
import microcat from "../../../assets/img/main/micro-category.png";

const CONSULTATION_SENT_KEY = "aero-consultation-sent";
const PHONE_PREFIX_LENGTH = 5;
const PHONE_MAX_DIGITS = 9;

function formatPhoneFromDigits(digits: string): string {
    const d = digits.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
    const slot = (index: number) => d[index] ?? "_";
    return `+375 ${slot(0)}${slot(1)} ${slot(2)}${slot(3)}${slot(4)}-${slot(5)}${slot(6)}-${slot(7)}${slot(8)}`;
}

function getPhoneCaretIndex(digitCount: number): number {
    const template = formatPhoneFromDigits("");
    let seen = 0;
    for (let i = 0; i < template.length; i += 1) {
        if (template[i] === "_") {
            if (seen === digitCount) return i;
            seen += 1;
        }
    }
    return template.length;
}

function extractPhoneDigits(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("375")) return digits.slice(3, 3 + PHONE_MAX_DIGITS);
    return digits.slice(0, PHONE_MAX_DIGITS);
}

function readConsultationSentFlag(): boolean {
    try {
        return typeof sessionStorage !== "undefined" && sessionStorage.getItem(CONSULTATION_SENT_KEY) !== null;
    } catch {
        return false;
    }
}

type PhoneMaskVisualProps = {
    digits: string;
    className: string;
};

function PhoneMaskVisual({ digits, className }: PhoneMaskVisualProps) {
    const slot = (index: number) => digits[index] ?? "_";

    const renderGroup = (start: number, length: number) => {
        const text = Array.from({ length }, (_, i) => slot(start + i)).join("");
        return (
            <span key={start} className={styles["consultation__phone-slot"]}>
                {text}
            </span>
        );
    };

    return (
        <span className={className} aria-hidden="true">
            <span className={styles["consultation__phone-prefix"]}>+375 </span>
            {renderGroup(0, 2)}
            <span className={styles["consultation__phone-sep"]}> </span>
            {renderGroup(2, 3)}
            <span className={styles["consultation__phone-sep"]}>-</span>
            {renderGroup(5, 2)}
            <span className={styles["consultation__phone-sep"]}>-</span>
            {renderGroup(7, 2)}
        </span>
    );
}

export const Main = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSentModal, setShowSentModal] = useState(readConsultationSentFlag);
    const [name, setName] = useState("");
    const [phoneDigits, setPhoneDigits] = useState("");
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [question, setQuestion] = useState("");
    const [consent, setConsent] = useState(false);
    const [nameError, setNameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [questionError, setQuestionError] = useState("");
    const [consentError, setConsentError] = useState("");
    const phoneInputRef = useRef<HTMLInputElement>(null);

    const phoneDisplay = formatPhoneFromDigits(phoneDigits);
    const showPhonePlaceholder = !phoneFocused && phoneDigits.length === 0;

    const placePhoneCaret = useCallback((digitCount: number) => {
        const el = phoneInputRef.current;
        if (!el) return;
        const pos = getPhoneCaretIndex(digitCount);
        el.setSelectionRange(pos, pos);
    }, []);

    const closeSentModal = useCallback(() => {
        try {
            sessionStorage.removeItem(CONSULTATION_SENT_KEY);
        } catch {}
        setShowSentModal(false);
    }, []);

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
        if (isSubmitting) return;

        if (/^\d$/.test(e.key)) {
            e.preventDefault();
            if (phoneDigits.length < PHONE_MAX_DIGITS) {
                updatePhoneDigits(phoneDigits + e.key);
            }
            return;
        }

        if (e.key === "Backspace") {
            e.preventDefault();
            if (phoneDigits.length > 0) {
                updatePhoneDigits(phoneDigits.slice(0, -1));
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

    const updatePhoneDigits = (next: string) => {
        setPhoneDigits(next);
        if (phoneError) setPhoneError("");
        requestAnimationFrame(() => placePhoneCaret(next.length));
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        updatePhoneDigits(extractPhoneDigits(e.target.value));
    };

    const handlePhonePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        updatePhoneDigits(extractPhoneDigits(e.clipboardData.getData("text")));
    };

    const handleConsultationReset = () => {
        setName("");
        setPhoneDigits("");
        setPhoneFocused(false);
        setQuestion("");
        setConsent(false);
        setNameError("");
        setPhoneError("");
        setQuestionError("");
        setConsentError("");
    };

    const handleConsultationSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        const errName = !name.trim() ? "Введите имя" : "";
        const errPhone =
            phoneDigits.length < PHONE_MAX_DIGITS ? "Введите номер телефона полностью" : "";
        const errQuestion = !question.trim() ? "Введите сообщение" : "";
        const errConsent = !consent
            ? "Необходимо согласие на обработку персональных данных"
            : "";

        setNameError(errName);
        setPhoneError(errPhone);
        setQuestionError(errQuestion);
        setConsentError(errConsent);

        if (errName || errPhone || errQuestion || errConsent) return;

        setIsSubmitting(true);
        window.setTimeout(() => {
            try {
                sessionStorage.setItem(CONSULTATION_SENT_KEY, "1");
            } catch {}
            window.location.reload();
        }, 3000);
    };

    return (
        <main className="page__content">
            <section className={styles.hero}>
                <div className={styles["hero__content"]}>
                    <h1 className={styles["hero__title"]}>СВОБОДА АЭРОСЪЕМКИ</h1>
                    <p className={styles["hero__description"]}>Дроны, камеры и аксессуары<br />для профессиональной и творческой<br />съёмки с воздуха.</p>
                    <Link to="/catalog" className={styles["hero__cta"]}>
                        СМОТРЕТЬ КАТАЛОГ
                    </Link>
                </div>
            </section>

            <section>
                <div className={styles["categories__grid"]}>
                    <Link to="/catalog" search={{ category: "drones" }} className={styles["categories__card"]}>
                        <img className={styles["categories__image"]} src={dronecat} alt="Дроны" />
                        <h2 className={styles["categories__title"]}>Дроны</h2>
                    </Link>
                    <Link to="/catalog" search={{ category: "cameras" }} className={styles["categories__card"]}>
                        <img className={styles["categories__image"]} src={cameracat} alt="Экшн-камеры" />
                        <h2 className={styles["categories__title"]}>Экшн-камеры</h2>
                    </Link>
                    <Link to="/catalog" search={{ category: "accessories" }} className={styles["categories__card"]}>
                        <img className={styles["categories__image"]} src={accescat} alt="Аксессуары" />
                        <h2 className={styles["categories__title"]}>Аксессуары</h2>
                    </Link>
                    <Link to="/catalog" search={{ category: "microphones" }} className={styles["categories__card"]}>
                        <img className={styles["categories__image"]} src={microcat} alt="Микрофоны" />
                        <h2 className={styles["categories__title"]}>Микрофоны</h2>
                    </Link>
                </div>
            </section>

            <section className={styles["consultation"]}>
                <div className={styles["consultation__inner"]}>
                    <h2 className={styles["consultation__title"]}>Нужна консультация? Задайте вопрос прямо сейчас!</h2>
                    <form
                        className={styles["consultation__form"]}
                        onSubmit={handleConsultationSubmit}
                        onReset={handleConsultationReset}
                    >
                        <div className={styles["consultation__fields"]}>
                            <div className={styles["consultation__field-block"]}>
                                <label
                                    className={`${styles["consultation__field"]} ${nameError ? styles["consultation__field--error"] : ""}`}
                                >
                                    <input
                                        className={styles["consultation__input"]}
                                        id="faq-name"
                                        type="text"
                                        name="name"
                                        placeholder="Имя"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (nameError) setNameError("");
                                        }}
                                        disabled={isSubmitting}
                                    />
                                </label>
                                {nameError ? (
                                    <p className={styles["consultation__form-error"]}>{nameError}</p>
                                ) : null}
                            </div>
                            <div className={styles["consultation__field-block"]}>
                                <label
                                    className={`${styles["consultation__field"]} ${styles["consultation__field--phone"]} ${phoneError ? styles["consultation__field--error"] : ""}`}
                                >
                                    <div className={styles["consultation__phone-stack"]}>
                                    {showPhonePlaceholder ? (
                                        <span className={styles["consultation__phone-placeholder"]} aria-hidden="true">
                                            +375 __ ___-__-__
                                        </span>
                                    ) : (
                                        <PhoneMaskVisual
                                            digits={phoneDigits}
                                            className={styles["consultation__phone-mask-visual"]}
                                        />
                                    )}
                                    <input
                                        ref={phoneInputRef}
                                        className={`${styles["consultation__input"]} ${styles["consultation__phone-input"]} ${showPhonePlaceholder ? styles["consultation__phone-input--overlay"] : styles["consultation__phone-input--mask"]}`}
                                        id="faq-phone"
                                        type="tel"
                                        name="phone"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        value={showPhonePlaceholder ? "" : phoneDisplay}
                                        onChange={handlePhoneChange}
                                        onKeyDown={handlePhoneKeyDown}
                                        onPaste={handlePhonePaste}
                                        onFocus={handlePhoneFocus}
                                        onBlur={handlePhoneBlur}
                                        onClick={handlePhoneClick}
                                        onSelect={handlePhoneSelect}
                                        disabled={isSubmitting}
                                        aria-label="Телефон"
                                    />
                                </div>
                            </label>
                                {phoneError ? (
                                    <p className={styles["consultation__form-error"]}>{phoneError}</p>
                                ) : null}
                            </div>
                        </div>
                        <div className={styles["consultation__message"]}>
                            <div className={styles["consultation__field-block"]}>
                                <label
                                    className={`${styles["consultation__field"]} ${styles["consultation__field--message"]} ${questionError ? styles["consultation__field--error"] : ""}`}
                                >
                                    <textarea
                                        className={styles["consultation__textarea"]}
                                        id="faq-question"
                                        name="question"
                                        placeholder="Вопрос или предмет заявки"
                                        value={question}
                                        onChange={(e) => {
                                            setQuestion(e.target.value);
                                            if (questionError) setQuestionError("");
                                        }}
                                        disabled={isSubmitting}
                                    />
                                </label>
                                {questionError ? (
                                    <p className={styles["consultation__form-error"]}>{questionError}</p>
                                ) : null}
                            </div>
                        </div>
                        <div className={styles["consultation__actions"]}>
                            <button
                                className={`${styles["consultation__button"]} ${styles["consultation__button--primary"]}`}
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Отправка..." : "Отправить сообщение"}
                            </button>
                            <button className={`${styles["consultation__button"]} ${styles["consultation__button--secondary"]}`} type="reset" disabled={isSubmitting}>
                                Стереть все
                            </button>
                        </div>
                        <div className={styles["consultation__checkbox-wrapper"]}>
                            <label className={styles["consultation__consent"]}>
                                <input
                                    className={styles["consultation__checkbox-input"]}
                                    id="faq-consent"
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => {
                                        setConsent(e.target.checked);
                                        if (e.target.checked) setConsentError("");
                                    }}
                                    disabled={isSubmitting}
                                />
                                <span className={styles["consultation__checkbox-box"]}></span>
                                <span className={styles["consultation__consent-text"]}>
                                    {" "}
                                    Даю согласие на обработку персональных данных
                                </span>
                            </label>
                            {consentError ? (
                                <p
                                    className={`${styles["consultation__form-error"]} ${styles["consultation__form-error--consent"]}`}
                                >
                                    {consentError}
                                </p>
                            ) : null}
                        </div>
                    </form>
                </div>
            </section>

            <SuccessModal
                open={showSentModal}
                title="Сообщение отправлено"
                titleId="consultation-sent-title"
                onClose={closeSentModal}
            />
        </main>
    )
}
