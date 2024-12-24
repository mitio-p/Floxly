import { useEffect, useState } from 'react';
import classes from './Notification.module.css';
import { createPortal } from 'react-dom';

export default function Notification({ message, onClose }) {
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    if (message) {
      setAlive(true);
      setTimeout(() => {
        setAlive(false);
        onClose();
      }, 5000);
    }
  }, [message]);

  if (!alive) return null;

  return createPortal(
    <div className={classes.notificationContainer}>
      <h2>{message}</h2>
    </div>,
    document.getElementById('notifications')
  );
}
