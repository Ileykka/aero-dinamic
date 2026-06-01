import { Link } from "@tanstack/react-router";
import heroImg from "../../../assets/img/about/about-banner.jpg";
import missionImg from "../../../assets/img/about/about-mission.jpg";
import space1Img from "../../../assets/img/about/about-space-1.jpg";
import space2Img from "../../../assets/img/about/about-space-2.jpg";
import space3Img from "../../../assets/img/about/about-space-3.jpg";
import space4Img from "../../../assets/img/about/about-space-4.jpg";
import iconService from "../../../assets/img/about/Icon-1.svg?raw";
import iconAcademy from "../../../assets/img/about/Icon-2.svg?raw";
import styles from "./About.module.css";

const SPACE_IMAGES = [
  { src: space1Img, alt: "Интерьер шоурума AERO" },
  { src: space2Img, alt: "Тестирование дрона в шоуруме" },
  { src: space3Img, alt: "Сборка и обслуживание дрона" },
  { src: space4Img, alt: "Пространство AERO Store" },
] as const;

const FEATURES = [
  {
    icon: iconService,
    title: "Авторизованный сервис",
    text: "Диагностика и ремонт с оригинальными запчастями. Мастера проходят сертификацию производителей.",
  },
  {
    icon: iconAcademy,
    title: "Академия AERO",
    text: "Курсы пилотирования и аэросъёмки для начинающих и профи. Сертификаты признаются индустрией.",
  },
] as const;

export const AboutPage = () => {
  return (
    <main className="page__content">
      <section className={styles.about}>
        <h1 className={styles["about__title"]}>О нас</h1>

        <div className={styles["about__hero"]}>
          <img className={styles["about__hero-image"]} src={heroImg} alt="" />
          <p className={styles["about__hero-caption"]}>
            НЕ ПРОСТО МАГАЗИН.
            <br />
            ЭКОСИСТЕМА ПОЛЕТА.
          </p>
        </div>

        <div className={styles["about__mission"]}>
          <article className={styles["about__mission-text"]}>
            <h2 className={styles["about__mission-title"]}>Наша Миссия</h2>
            <p className={styles["about__mission-paragraph"]}>
              Мы верим, что технологии должны расширять границы человеческого восприятия. Начав как
              небольшой сервисный центр, AERO выросла в крупнейшего дистрибьютора инновационных
              решений для аэросъемки.
            </p>
            <p className={styles["about__mission-paragraph"]}>
              Сегодня мы поставляем оборудование для ведущих киностудий, промышленных гигантов и
              энтузиастов, которые ценят бескомпромиссное качество. Наша цель — сделать небо
              доступным для каждого творца.
            </p>
          </article>
          <div className={styles["about__mission-visual"]}>
            <img className={styles["about__mission-image"]} src={missionImg} alt="" />
          </div>
        </div>

        <article className={styles["about__innovation"]}>
          <div className={styles["about__innovation-grid"]}>
            {SPACE_IMAGES.map((item, idx) => (
              <div
                key={item.src}
                className={`${styles["about__innovation-cell"]} ${styles[`about__innovation-cell--${idx + 1}`]}`}
              >
                <img className={styles["about__innovation-image"]} src={item.src} alt={item.alt} />
              </div>
            ))}
          </div>
          <div className={styles["about__innovation-content"]}>
            <h2 className={styles["about__innovation-title"]}>ПРОСТРАНСТВО ИННОВАЦИЙ</h2>
            <p className={styles["about__text"]}>
              Наши шоурумы — это не просто торговые точки.
              Это технологические хабы в стиле "стелс", где вы
              можете протестировать флагманские модели,
              получить консультацию инженеров и погрузиться в
              атмосферу профессиональной авиации.
            </p>
            <ul className={styles["about__features"]}>
              {FEATURES.map((feature) => (
                <li key={feature.title} className={styles["about__feature"]}>
                  <span
                    className={styles["about__feature-icon"]}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: feature.icon }}
                  />
                  <div className={styles["about__feature-body"]}>
                    <p className={styles["about__feature-title"]}>{feature.title}</p>
                    <p className={styles["about__feature-text"]}>{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className={styles["about__cta"]}>
          <h2 className={styles["about__cta-title"]}>ГОТОВЫ К ПОЛЕТУ?</h2>
          <p className={styles["about__cta-text"]}>
            Наши эксперты помогут подобрать идеальное решение под ваши задачи — от селфи-дрона до
            промышленной платформы.
          </p>
          <Link to="/contacts" className={styles["about__cta-btn"]}>
            Связаться с нами
          </Link>
        </article>
      </section>
    </main>
  );
};
