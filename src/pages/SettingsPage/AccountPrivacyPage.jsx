import classes from './AccountPrivacyPage.module.css';
import SwitchInput from '../../components/CustomInput/SwitchInput.jsx';
import { useContext, useEffect, useState } from 'react';
import UserCTX from '../../Context/UserCTX.jsx';
import NotificationCTX from '../../Context/NotificationCTX.jsx';
import authFetch from '../../Utils/authFetch.js';
import { getLocale } from '../../Utils/localization.js';

export default function AccountPrivacyPage() {
  const userData = useContext(UserCTX);
  const setNotification = useContext(NotificationCTX);
  const [isAccountPrivate, setAccountPrivate] = useState(userData.user.privateAccount);
  console.log(userData.user.privateAccount);

  async function handleClick(isPrivate) {
    if (isPrivate) {
      const response = await authFetch('http://localhost:3000/auth/enablePrivateAccount', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setNotification((await response.json()).success.message);
        userData.setUser((user) => ({ ...user, privateAccount: true }));
        setAccountPrivate(true);
      }
    } else {
      const response = await authFetch('http://localhost:3000/auth/disablePrivateAccount', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setNotification((await response.json()).success.message);
        userData.setUser((user) => ({ ...user, privateAccount: false }));
        setAccountPrivate(false);
      }
    }
  }

  return (
    <main className={classes.globalContainer}>
      <div className={classes.opitonContainer}>
        <h1>{getLocale('account_privacy')}</h1>
        <div className={classes.option}>
          <div>
            <h2>{getLocale('private_account')}</h2>
            <h3>
              {getLocale('private_account_description_public')}
              <br />
              {getLocale('private_account_description_private')}
            </h3>
          </div>
          <SwitchInput onInputChange={handleClick} value={isAccountPrivate} />
        </div>
      </div>
    </main>
  );
}
