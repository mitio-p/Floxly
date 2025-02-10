import { useState } from 'react';
import classes from './BestFriendRow.module.css';

export default function BestFriendRow({ data, isBestFriends }) {
  const [bestFriends, setBestFriends] = useState(isBestFriends);
  return (
    <div className={classes.rowContainer}>
      <img src={data.profilePicture} />
      <div>
        <h1>{data.username}</h1>
        <h2>{data.fullName}</h2>
      </div>
      {bestFriends ? (
        <button className={classes.removeFromList}>Remove from the list</button>
      ) : (
        <button className={classes.addToList}>Add to the list</button>
      )}
    </div>
  );
}
