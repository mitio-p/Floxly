import { useContext, useEffect, useState } from 'react';
import NotificationRow from '../../components/NotificationRow/NotificationRow';
import classes from './NotificationPage.module.css';
import UserCTX from '../../Context/UserCTX';

export default function NotificationPage() {
  const userData = useContext(UserCTX);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (userData?.user.notifications) {
      setNotifications(userData.user.notifications);
    }
  }, [userData.user]);
  return (
    <main className={classes.globalContainer}>
      <h1>Notifications</h1>
      <div>
        {notifications.map((notification) => (
          <NotificationRow key={notification.date} data={notification} />
        ))}
      </div>
    </main>
  );
}
