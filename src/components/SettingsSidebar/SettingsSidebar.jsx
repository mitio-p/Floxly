import { Link, useLocation } from 'react-router-dom';
import { getLocale } from '../../Utils/localization';
import classes from './SettingsSidebar.module.css';

import profileIcon from '../../assets/icons/profileIcon.svg';
import lockIcon from '../../assets/icons/lock.svg';
import starIcon from '../../assets/icons/star.svg';
import { useEffect, useState } from 'react';

export default function SettingsSidebar() {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const lastSegment = pathParts[pathParts.length - 1];
  const [width, setWidth] = useState(window.innerWidth);

  function resize() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', resize);
  }, []);

  return (
    <>
      {(width > 1275 || lastSegment === 'settings') && (
        <aside className={classes.sidebar}>
          <h1>{getLocale('settings')}</h1>
          <ul>
            <li>
              <Link to={'edit'}>
                <div
                  className={
                    lastSegment === 'edit'
                      ? classes.activeIndicator
                      : classes.passiveIndicator
                  }
                ></div>
                <img src={profileIcon} />
                <p>{getLocale('edit_profile')}</p>
              </Link>
            </li>
            <li>
              <Link to={'privacy'}>
                <div
                  className={
                    lastSegment === 'privacy'
                      ? classes.activeIndicator
                      : classes.passiveIndicator
                  }
                ></div>
                <img src={lockIcon} />
                <p>{getLocale('account_privacy')}</p>
              </Link>
            </li>
            <li>
              <Link to={'best-friends'}>
                <div
                  className={
                    lastSegment === 'best-friends'
                      ? classes.activeIndicator
                      : classes.passiveIndicator
                  }
                ></div>
                <img src={starIcon} />
                <p>{getLocale('best_friends')}</p>
              </Link>
            </li>
          </ul>
        </aside>
      )}
    </>
  );
}
