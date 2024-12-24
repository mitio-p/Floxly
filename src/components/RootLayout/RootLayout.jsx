import { Outlet, redirect, useLoaderData, useLocation } from 'react-router-dom';
import SideBar from '../SideBar/SideBar.jsx';
import classes from './RootLayout.module.css';
import { useContext, useEffect } from 'react';
import UserCTX from '../../Context/UserCTX.jsx';
import tokenSevice from '../../Utils/tokenService.js';
import authFetch from '../../Utils/authFetch.js';
import { rootSideBarOptions } from '../../config/RootSideBarOptions.js';

export default function RootLayout() {
  const loaderData = useLoaderData();
  const userData = useContext(UserCTX);
  const location = useLocation();
  useEffect(() => {
    userData.setUser(loaderData);
  }, [loaderData, userData]);
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        document.title = 'Floxly \u00B7 Home';
        break;
      case '/search':
        document.title = 'Floxly \u00B7 Search';
        break;

      default:
        document.title = 'Floxly';
    }
  }, [location]);
  return (
    <div className={classes.rootContainer}>
      <SideBar title={'Floxly'} isRootSideBar={true} options={rootSideBarOptions} />
      <Outlet />
    </div>
  );
}

export async function loader() {
  const userData = await authFetch('http://localhost:3000/auth/user', { credentials: 'include' });

  if (userData.ok) {
    return userData;
  } else {
    return redirect('/auth?mode=login');
  }
}
