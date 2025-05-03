import { NavLink, useNavigate } from 'react-router-dom';
import classes from './SideBar.module.css';

import houseIcon from '../../assets/icons/house.svg';
import searchIcon from '../../assets/icons/search.svg';
import messagesIcon from '../../assets/icons/message.svg';
import notificationsIcon from '../../assets/icons/notifications.svg';
import createIcon from '../../assets/icons/create.svg';
import logoutIcon from '../../assets/icons/exit.svg';
import UserCTX from '../../Context/UserCTX';
import { useContext, useEffect, useState } from 'react';
import { generateRandomString } from '../../Utils/generateRandomString';

export default function SideBar({ title, isRootSideBar, options }) {
  const userData = useContext(UserCTX);
  const navigate = useNavigate();
  const [width, setWidth] = useState(window.innerWidth);

  function resize() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', resize);
  }, []);

  return (
    <aside className={width > 1000 ? classes.sideBar : classes.sideBarMobile}>
      {isRootSideBar ? (
        <>
          {width > 1000 && (
            <div className={classes.logoContainer}>
              <p
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                {title}
              </p>
            </div>
          )}
          {userData.user.role === 'admin' && width > 1000 && <p className={classes.adminTag}>Admin!</p>}
        </>
      ) : (
        <div className={classes.titleContainer}>
          <p>{title}</p>
        </div>
      )}
      <ul className={width > 1000 ? classes.barItems : classes.barItemsMobile}>
        {options.map((option) =>
          option.place === 'start' ? (
            option.type !== 'sectionTitle' ? (
              <li
                onClick={option.type === 'button' ? option.onClick : undefined}
                key={option.route ? option.route + generateRandomString(10) : generateRandomString(10)}
                style={width < 1000 ? { display: 'flex', justifyContent: 'center' } : undefined}
              >
                {option.type === 'link' ? (
                  <NavLink
                    to={option.routeType === 'static' ? option.route : 'user/' + userData.user.username}
                    className={({ isActive }) => (isActive ? classes.activeLink : classes.passiveLink)}
                  >
                    {width > 1000 && <div className={classes.indicator}></div>}
                    {option.iconType === 'static' ? (
                      <img src={option.icon} />
                    ) : (
                      <img src={userData.user.profilePicture} className={classes.picture} />
                    )}
                    {width > 1000 && <p>{option.label}</p>}
                  </NavLink>
                ) : (
                  <>
                    {option.iconType === 'static' ? (
                      <img src={option.icon} />
                    ) : (
                      <img src={userData.user.profilePicture} className={classes.picture} />
                    )}
                    {width > 1000 && <p>{option.label}</p>}
                  </>
                )}
              </li>
            ) : (
              <></>
            )
          ) : null
        )}
      </ul>
      {width > 1000 && (
        <ul className={classes.endItems}>
          {options.map((option) =>
            option.place === 'end' ? (
              option.type !== 'sectionTitle' ? (
                <li
                  key={option.route ? option.route + generateRandomString(10) : generateRandomString(10)}
                  onClick={option.type === 'button' ? () => option.onClick(navigate) : undefined}
                >
                  <img src={option.icon} />
                  <p>{option.label}</p>
                </li>
              ) : (
                <></>
              )
            ) : null
          )}
        </ul>
      )}
    </aside>
  );
}
