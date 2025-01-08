import classes from './AccountPrivacyPage.module.css';
import SwitchInput from '../../components/CustomInput/SwitchInput.jsx';
import { useContext, useEffect, useState } from 'react';
import UserCTX from '../../Context/UserCTX.jsx';
import NotificationCTX from '../../Context/NotificationCTX.jsx';
import authFetch from '../../Utils/authFetch.js';

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
        <h1>Account privacy</h1>
        <div className={classes.option}>
          <div>
            <h2>Private account</h2>
            <h3>
              When your account is public everyone can see your gallery and posts.
              <br />
              When your account is private only your followers what you approved will be able to see your gallery and
              posts.
            </h3>
          </div>
          <SwitchInput onInputChange={handleClick} value={isAccountPrivate} />
        </div>
      </div>
    </main>
  );
}
