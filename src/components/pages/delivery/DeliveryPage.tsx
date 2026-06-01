import { useNavigate } from "@tanstack/react-router";
import iconExpress from "../../../assets/img/delivery/Icon-2.svg?raw";
import iconSafety from "../../../assets/img/delivery/Icon-1.svg?raw";
import iconCourier from "../../../assets/img/delivery/Icon-3.svg?raw";
import iconPickup from "../../../assets/img/delivery/Icon-4.svg?raw";
import iconStore from "../../../assets/img/delivery/Icon-5.svg?raw";
import iconSpeed from "../../../assets/img/delivery/speed.svg?raw";
import { DeliveryMap } from "./DeliveryMap";
import iconCard from "../../../assets/img/delivery/card.svg?raw";
import iconCash from "../../../assets/img/delivery/cash.svg?raw";
import iconQr from "../../../assets/img/delivery/qr.svg?raw";
import heroImg from "../../../assets/img/delivery/image_1.jpg";
import styles from "./Delivery.module.css";

const DELIVERY_METHODS = [
  {
    id: "courier",
    icon: iconCourier,
    title: "Курьером",
    text: "Доставка до двери в удобное для вас время. Курьер свяжется с вами за час до прибытия.",
    time: "СЕГОДНЯ / ЗАВТРА",
    priceFrom: "от",
    priceAmount: "30 BYN",
  },
  {
    id: "pickup-points",
    icon: iconPickup,
    title: "Пункты выдачи",
    text: "Более 2500 точек выдачи заказов по всей Беларуси Европочта, СДЭК, Белпочта.",
    time: "СЕГОДНЯ / ЗАВТРА",
    priceFrom: "от",
    priceAmount: "25 BYN",
  },
  {
    id: "pickup-store",
    icon: iconStore,
    title: "Самовывоз",
    text: "Заберите заказ самостоятельно из нашего магазина в самом центре города.",
    time: "СЕГОДНЯ / ЗАВТРА",
    priceFrom: null,
    priceAmount: "Бесплатно",
  },
] as const;

const PAYMENT_METHODS = [
  { icon: iconCard, label: "КАРТОЙ ОНЛАЙН" },
  { icon: iconCash, label: "НАЛИЧНЫМИ ПРИ ПОЛУЧЕНИИ" },
  { icon: iconQr, label: "QR-КОДОМ" },
] as const;

export const DeliveryPage = () => {
  const navigate = useNavigate();

  return (
    <main className="page__content">
      <section className={styles.delivery}>
        <h1 className={styles["delivery__title"]}>Доставка</h1>

        <div className={styles["delivery__hero-card"]}>
          <div className={styles["delivery__hero"]}>
            <div className={styles["delivery__hero-main"]}>
              <p className={styles["delivery__hero-lead"]}>
                Мы доставляем технологичное оборудование AERO в любую точку страны с максимальной
                скоростью и гарантией сохранности.
              </p>
              <div className={styles["delivery__hero-badges"]}>
                <div className={styles["delivery__badge"]}>
                  <span
                    className={styles["delivery__badge-icon"]}
                    dangerouslySetInnerHTML={{ __html: iconExpress }}
                    aria-hidden="true"
                  />
                  <div className={styles["delivery__badge-text"]}>
                    <p className={styles["delivery__badge-label"]}>Экспресс</p>
                    <p className={styles["delivery__badge-value"]}>От 2 часов</p>
                  </div>
                </div>
                <div className={styles["delivery__badge"]}>
                  <span
                    className={styles["delivery__badge-icon"]}
                    dangerouslySetInnerHTML={{ __html: iconSafety }}
                    aria-hidden="true"
                  />
                  <div className={styles["delivery__badge-text"]}>
                    <p className={styles["delivery__badge-label"]}>Безопасность</p>
                    <p className={styles["delivery__badge-value"]}>Страховка 100%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles["delivery__hero-media"]}>
              <img className={styles["delivery__hero-image"]} src={heroImg} alt="" />
            </div>
          </div>
        </div>

        <div id="delivery-methods" className={styles["delivery__methods-section"]}>
          <h2 className={styles["delivery__section-title"]}>Способы получения</h2>
          <div className={styles["delivery__methods"]}>
            {DELIVERY_METHODS.map((method) => (
              <article
                key={method.id}
                id={method.id === "pickup-store" ? "delivery-pickup" : undefined}
                className={styles["delivery__method"]}
              >
                <span
                  className={styles["delivery__method-icon"]}
                  dangerouslySetInnerHTML={{ __html: method.icon }}
                  aria-hidden="true"
                />
                <h3 className={styles["delivery__method-title"]}>{method.title}</h3>
                <p className={styles["delivery__method-text"]}>{method.text}</p>
                <div className={styles["delivery__method-divider"]} />
                <div className={styles["delivery__method-rows"]}>
                  <div className={styles["delivery__method-row"]}>
                    <span className={styles["delivery__method-row-label"]}>Срок ожидания</span>
                    <span className={styles["delivery__method-row-value"]}>{method.time}</span>
                  </div>
                  <div className={styles["delivery__method-row"]}>
                    <span className={styles["delivery__method-row-label"]}>Стоимость</span>
                    <span className={styles["delivery__method-price"]}>
                      {method.priceFrom ? (
                        <>
                          <span className={styles["delivery__method-price-from"]}>
                            {method.priceFrom}
                          </span>{" "}
                          <span className={styles["delivery__method-price-amount"]}>
                            {method.priceAmount}
                          </span>
                        </>
                      ) : (
                        <span
                          className={`${styles["delivery__method-price-amount"]} ${styles["delivery__method-price-amount--solo"]}`}
                        >
                          {method.priceAmount}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles["delivery__map-row"]}>
          <DeliveryMap />

          <aside className={styles["delivery__express"]}>
            <div className={styles["delivery__express-head"]}>
              <span
                className={styles["delivery__express-icon"]}
                dangerouslySetInnerHTML={{ __html: iconSpeed }}
                aria-hidden="true"
              />
              <h2 className={styles["delivery__express-title"]}>Экстренная доставка</h2>
            </div>

            <div className={styles["delivery__express-body"]}>
              <p className={styles["delivery__express-text"]}>
                При оформлении заказа до 14:00 мы доставим его в этот же день в пределах МКАД.
                Быстрее, чем вы успеете подготовить аккумуляторы.
              </p>
            </div>

            <div className={styles["delivery__express-footer"]}>
              <button
                type="button"
                className={styles["delivery__express-btn"]}
                onClick={() => navigate({ to: "/contacts" })}
              >
                Узнать больше
              </button>
            </div>
          </aside>
        </div>

        <div id="delivery-payments" className={styles["delivery__payments"]}>
          <h2 className={styles["delivery__payments-title"]}>Способы оплаты</h2>
          <div className={styles["delivery__payments-grid"]}>
            {PAYMENT_METHODS.map((item) => (
              <div key={item.label} className={styles["delivery__payment-item"]}>
                <span
                  className={styles["delivery__payment-icon"]}
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                  aria-hidden="true"
                />
                <span className={styles["delivery__payment-label"]}>{item.label}</span>
              </div>
            ))}
          </div>
          <hr className={styles["delivery__payments-divider"]} />
          <p className={styles["delivery__payments-note"]}>
            «Безопасность каждой транзакции гарантирована многоуровневым шифрованием. Мы принимаем
            платежи любым удобным для вас способом.»
          </p>
        </div>
      </section>
    </main>
  );
};
