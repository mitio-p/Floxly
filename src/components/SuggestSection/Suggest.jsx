import { useContext, useEffect, useState } from 'react';
import classes from './Suggest.module.css';
import UserCTX from '../../Context/UserCTX';
import SuggestResult from './SuggestResult';
import { getLocale } from '../../Utils/localization';

export default function Suggest() {
  const userData = useContext(UserCTX);
  const [width, setWidth] = useState(window.innerWidth);

  function resize() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', resize);
  }, []);
  return (
    <>
      {width > 1550 && (
        <div className={classes.suggestContainer}>
          <h1>{getLocale('suggested')}</h1>
          <div className={classes.suggestionsContainer}>
            {userData.user?.suggestedAccounts
              ? userData.user.suggestedAccounts.map((account) => <SuggestResult key={account._id} account={account} />)
              : null}
          </div>
        </div>
      )}
    </>
  );
}
