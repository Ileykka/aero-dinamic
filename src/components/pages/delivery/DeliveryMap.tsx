import iconTarget from "../../../assets/img/delivery/Icon-6.svg?raw";
import mapImg from "../../../assets/img/delivery/Map view.png";
import styles from "./Delivery.module.css";

const STORE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("ул. Немига, 28, Минск, Беларусь");

export const DeliveryMap = () => {
  return (
    <div className={styles["delivery__map-col"]}>
      <div className={styles["delivery__map"]}>
        <img
          className={styles["delivery__map-image"]}
          src={mapImg}
          width={1104}
          height={885}
          alt="Карта — магазин AERO, ул. Немига, 28, Минск"
        />

        <div className={styles["delivery__map-stack"]}>
          <a
            className={styles["delivery__map-store"]}
            href={STORE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              className={styles["delivery__map-store-icon"]}
              dangerouslySetInnerHTML={{ __html: iconTarget }}
              aria-hidden="true"
            />
            <span className={styles["delivery__map-store-label"]}>Магазин AERO в Минске</span>
          </a>

          <div className={styles["delivery__map-info"]}>
            <p className={styles["delivery__map-info-address"]}>ул. Немига, 28</p>
            <p className={styles["delivery__map-info-hours"]}>Ежедневно с 10:00 до 22:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};
