import { useEffect } from "react";
import styles from "./SuccessModal.module.css";

type SuccessModalProps = {
  open: boolean;
  title: string;
  titleId?: string;
  closeLabel?: string;
  onClose: () => void;
};

export function SuccessModal({
  open,
  title,
  titleId = "success-modal-title",
  closeLabel = "Закрыть",
  onClose,
}: SuccessModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles["success-modal__backdrop"]} role="presentation">
      <div
        className={styles["success-modal"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles["success-modal__title"]}>
          {title}
        </h2>
        <button type="button" className={styles["success-modal__close"]} onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
