import { useContext } from 'react';
import classes from './Home.module.css';
import UserCTX from '../../Context/UserCTX';

export default function HomeView() {
  const userData = useContext(UserCTX);
  return (
    <div className={classes.homeViewContainer}>
      <p>{userData.user.username}</p>
    </div>
  );
}
