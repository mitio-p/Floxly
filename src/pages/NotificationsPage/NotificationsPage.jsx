import { useContext, useEffect, useState } from 'react';
import NotificationRow from '../../components/NotificationRow/NotificationRow';
import classes from './NotificationPage.module.css';
import UserCTX from '../../Context/UserCTX';
import authFetch from '../../Utils/authFetch';
import { useLoaderData, useRevalidator } from 'react-router-dom';

export default function NotificationPage() {
  const loaderData = useLoaderData();
  return (
    <main className={classes.globalContainer}>
      <h1>Notifications</h1>
      <div>
        {loaderData &&
          loaderData.map((notification) => <NotificationRow key={notification.date} data={notification} />)}
      </div>
    </main>
  );
}

export async function loader() {
  const response = await authFetch('http://localhost:3000/floxly/notifications', { credentials: 'include' });

  if (response.ok) {
    return response;
  }
}
