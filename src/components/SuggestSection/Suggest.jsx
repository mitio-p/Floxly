import { useContext } from 'react';
import classes from './Suggest.module.css';
import UserCTX from '../../Context/UserCTX';
import SuggestResult from './SuggestResult';

export default function Suggest() {
  const userData = useContext(UserCTX);
  return (
    <div className={classes.suggestContainer}>
      <h1>Suggested</h1>
      <div className={classes.suggestionsContainer}>
        {userData.user?.suggestedAccounts
          ? userData.user.suggestedAccounts.map((account) => <SuggestResult key={account._id} account={account} />)
          : null}
      </div>
    </div>
  );
}
