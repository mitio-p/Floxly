import { Outlet, redirect, useLoaderData, useLocation } from 'react-router-dom';
import SideBar from '../SideBar/SideBar.jsx';
import classes from './RootLayout.module.css';
import { useContext, useEffect } from 'react';
import UserCTX from '../../Context/UserCTX.jsx';
import tokenSevice from '../../Utils/tokenService.js';
import authFetch from '../../Utils/authFetch.js';
import { rootSideBarOptions } from '../../config/RootSideBarOptions.js';
import SocketCTX from '../../Context/SocketCTX.jsx';

export default function RootLayout() {
  const loaderData = useLoaderData();
  const userData = useContext(UserCTX);
  const location = useLocation();
  const socket = useContext(SocketCTX);

  useEffect(() => {
    userData.setUser(loaderData);
    if (socket.connected) {
      socket.disconnect();
      setTimeout(async () => {
        socket.connect();

        for (const conversation of loaderData.conversations) {
          socket.emit('join_conversation', conversation._id);
        }
      }, 500);
    }
  }, [loaderData]);
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        document.title = 'Floxly \u00B7 Home';
        break;
      case '/search':
        document.title = 'Floxly \u00B7 Search';
        break;

      case '/settings':
        document.title = 'Floxly \u00B7 Settings';
        break;

      default:
        document.title = 'Floxly';
    }
  }, [location]);

  useEffect(() => {
    if (!localStorage.getItem('lang')) {
      localStorage.setItem('lang', 'en');
    }
  }, []);
  return (
    <div className={classes.rootContainer}>
      <SideBar title={'Floxly'} isRootSideBar={true} options={rootSideBarOptions} />
      <Outlet />
    </div>
  );
}

export async function loader() {
  const userData = await authFetch('http://localhost:3000/auth/user', {
    credentials: 'include',
  });

  if (userData.ok) {
    return userData;
  } else {
    return redirect('/auth?mode=login');
  }
}
