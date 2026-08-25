import React from 'react';
import { useFeedStore } from '../store/useFeedStore';
import styles from '../styles/Toast.module.css';

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useFeedStore();

  if (notifications.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {notifications.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.toastContent}>
            <span className={styles.toastMessage}>{toast.message}</span>
            <span className={styles.toastTime}>{toast.timestamp}</span>
          </div>
          <button
            onClick={() => removeNotification(toast.id)}
            className={styles.closeBtn}
            aria-label="Close Notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
