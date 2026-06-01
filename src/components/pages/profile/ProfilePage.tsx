import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../../auth/AuthContext";
import { useRequireAuth } from "../../../auth/useRequireAuth";
import { formatOrderDate } from "../../../orders/formatOrderDate";
import { useOrders } from "../../../orders/OrdersContext";
import { formatPrice } from "../../../lib/formatPrice";
import authorizationIcon from "../../../assets/img/main/authorization.svg?raw";
import logoutIcon from "../../../assets/img/profile/logout.svg?raw";
import styles from "./Profile.module.css";

export const ProfilePage = () => {
  const { isAuthed } = useRequireAuth();
  const { user, logout } = useAuth();
  const { orders, ordersTotalByn, getStatusLabel, getOrderTitle } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthed) {
      navigate({ to: "/register" });
    }
  }, [isAuthed, navigate]);

  if (!isAuthed || !user) return null;

  const displayName =
    [user.name, user.surname].filter(Boolean).join(" ").trim() || user.login || "User";

  return (
    <main className="page__content">
      <section className={styles.profile}>
        <h1 className={styles["profile__title"]}>Профиль</h1>

        <div className={styles["profile__summary"]}>
          <article className={styles["profile__user-card"]}>
            <div className={styles["profile__user-main"]}>
              <span
                className={styles["profile__avatar"]}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: authorizationIcon }}
              />
              <div className={styles["profile__user-text"]}>
                <p className={styles["profile__user-name"]}>{displayName}</p>
                <p className={styles["profile__user-email"]}>{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              className={styles["profile__logout"]}
              onClick={() => logout()}
              aria-label="Выйти из аккаунта"
            >
              <span
                className={styles["profile__logout-icon"]}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: logoutIcon }}
              />
            </button>
          </article>

          <article className={styles["profile__total-card"]}>
            <p className={styles["profile__total-label"]}>Общая сумма заказов</p>
            <p className={styles["profile__total-value"]}>
              {orders.length > 0 ? formatPrice(ordersTotalByn) : formatPrice(0)}
            </p>
          </article>
        </div>

        <section className={styles["profile__orders-panel"]}>
          <h2 className={styles["profile__orders-title"]}>История заказов</h2>

          {orders.length === 0 ? (
            <p className={styles["profile__orders-empty"]}>У вас пока нет заказов</p>
          ) : (
            <ul className={styles["profile__orders"]}>
              {orders.map((order) => {
                const thumb = order.lines[0]?.image;
                return (
                  <li key={order.id} className={styles["profile__order"]}>
                    <div className={styles["profile__order-thumb"]}>
                      {thumb ? (
                        <img className={styles["profile__order-image"]} src={thumb} alt="" />
                      ) : null}
                    </div>
                    <div className={styles["profile__order-cell"]}>
                      <span className={styles["profile__order-label"]}>Заказ</span>
                      <span className={styles["profile__order-value"]}>{getOrderTitle(order)}</span>
                    </div>
                    <div className={styles["profile__order-cell"]}>
                      <span className={styles["profile__order-label"]}>Дата</span>
                      <span className={styles["profile__order-value"]}>
                        {formatOrderDate(order.createdAt)}
                      </span>
                    </div>
                    <div className={styles["profile__order-cell"]}>
                      <span className={styles["profile__order-label"]}>Статус</span>
                      <span className={styles["profile__order-value"]}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div
                      className={`${styles["profile__order-cell"]} ${styles["profile__order-cell--amount"]}`}
                    >
                      <span className={styles["profile__order-label"]}>Сумма</span>
                      <span className={styles["profile__order-value"]}>
                        {formatPrice(order.totalByn)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
};
