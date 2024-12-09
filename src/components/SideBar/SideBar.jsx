import { NavLink, useNavigate } from 'react-router-dom';
import classes from './SideBar.module.css';

import houseIcon from '../../assets/icons/house.svg';
import searchIcon from '../../assets/icons/search.svg';
import messagesIcon from '../../assets/icons/message.svg';
import notificationsIcon from '../../assets/icons/notifications.svg';
import createIcon from '../../assets/icons/create.svg';
import logoutIcon from '../../assets/icons/exit.svg';
import UserCTX from '../../Context/UserCTX';
import { useContext } from 'react';

export default function SideBar() {
  const userData = useContext(UserCTX);
  const navigate = useNavigate();

  async function logOut() {
    const response = await fetch('http://localhost:3000/auth/logout', { credentials: 'include' });

    if (response.ok) {
      navigate('/auth?mode=login');
    }
  }

  return (
    <aside className={classes.sideBar}>
      <div className={classes.logoContainer}>
        <p
          onClick={() => {
            location.reload();
          }}
          to="/"
        >
          FLOXLY
        </p>
      </div>
      <ul className={classes.barItems}>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? classes.activeLink : classes.passiveLink)}>
            <div className={classes.indicator}></div>
            <img src={houseIcon} alt="Home" />
            <p>Home</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="/search" className={({ isActive }) => (isActive ? classes.activeLink : classes.passiveLink)}>
            <div className={classes.indicator}></div>
            <img src={searchIcon} alt="Search" />
            <p>Search</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="/messages" className={({ isActive }) => (isActive ? classes.activeLink : classes.passiveLink)}>
            <div className={classes.indicator}></div>
            <img src={messagesIcon} alt="Messages" />
            <p>Messages</p>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/notifications"
            className={({ isActive }) => (isActive ? classes.activeLink : classes.passiveLink)}
          >
            <div className={classes.indicator}></div>
            <img src={notificationsIcon} alt="Notifications" />
            <p>Notifications</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="/create" className={({ isActive }) => (isActive ? classes.activeLink : classes.passiveLink)}>
            <div className={classes.indicator}></div>
            <img src={createIcon} alt="Create" />
            <p>Create</p>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`user/${userData.user.username}`}
            className={({ isActive }) => (isActive ? classes.activeLink : classes.passiveLink)}
          >
            <div className={classes.indicator}></div>
            <img src={userData.user.profilePicture} alt="Create" className={classes.picture} />
            <p>Profile</p>
          </NavLink>
        </li>
      </ul>
      <ul className={classes.endItems}>
        <li onClick={logOut}>
          <img src={logoutIcon} alt="" />
          <p>Log out</p>
        </li>
      </ul>
    </aside>
  );
}
