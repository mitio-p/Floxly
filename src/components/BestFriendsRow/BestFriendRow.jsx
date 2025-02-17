import { useState } from 'react';
import classes from './BestFriendRow.module.css';
import authFetch from '../../Utils/authFetch';

export default function BestFriendRow({ data, isBestFriends }) {
  const [bestFriends, setBestFriends] = useState(isBestFriends);
  async function handleAddBestFriend() {
    const response = await authFetch('http://localhost:4000/user/addBestFriend', {
      method: 'POST',
      credentials: 'include',
      body: data._id,
      headers: { 'Content-Type': 'text/plain' },
    });

    if (response.ok) {
      setBestFriends(true);
    }
  }

  async function handleRemoveBestFriend() {
    const response = await authFetch('http://localhost:4000/user/removeBestFriend', {
      method: 'POST',
      credentials: 'include',
      body: data._id,
      headers: { 'Content-Type': 'text/plain' },
    });

    if (response.ok) {
      setBestFriends(false);
    }
  }
  return (
    <div className={classes.rowContainer}>
      <img src={data.profilePicture} />
      <div style={{ marginLeft: '10px' }}>
        <h1>{data.username}</h1>
        <h2>{data.fullName}</h2>
      </div>
      {bestFriends ? (
        <button className={classes.removeFromList} onClick={handleRemoveBestFriend}>
          Remove from the list
        </button>
      ) : (
        <button className={classes.addToList} onClick={handleAddBestFriend}>
          Add to the list
        </button>
      )}
    </div>
  );
}
