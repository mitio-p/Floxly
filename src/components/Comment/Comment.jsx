import classes from './Comment.module.css';
import emptyHeart from '../../assets/icons/heart-empty.svg';
import fullHeart from '../../assets/icons/heart-full.svg';
import authFetch from '../../Utils/authFetch';
import { useContext, useState } from 'react';
import UserCTX from '../../Context/UserCTX';

export default function Comment({ data, picId }) {
  const userData = useContext(UserCTX);

  const [likers, setLikers] = useState(data.likers);

  const isLiked = likers.includes(userData.user.uid);

  async function handleLike() {
    const responce = await authFetch(`http://localhost:3000/floxly/photo/${picId}/comment/like`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ id: data.id }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (responce.ok) {
      setLikers((prev) => {
        const updatedLikers = [...prev];
        updatedLikers.push(userData.user.uid);
        return updatedLikers;
      });
    }
  }

  async function handleCancelLike() {
    const responce = await authFetch(`http://localhost:3000/floxly/photo/${picId}/comment/cancelLike`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ id: data.id }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (responce.ok) {
      setLikers((prev) => {
        const updatedLikers = [...prev];
        const userIndex = updatedLikers.indexOf(userData.user.uid);
        updatedLikers.splice(userIndex, 1);
        return updatedLikers;
      });
    }
  }

  return (
    <div className={classes.commentContainer}>
      <div className={classes.commentDetails}>
        <img className={classes.profilePicture} src={data.author.profilePicture} alt="" />
        <p className={classes.commentText}>
          <span className={classes.username}>{data.author.username}</span>
          {data.text}
        </p>
        <div className={classes.like}>
          <img src={isLiked ? fullHeart : emptyHeart} alt="" onClick={isLiked ? handleCancelLike : handleLike} />
          <p className={classes.likesCount}>{likers.length}</p>
        </div>
      </div>
    </div>
  );
}
