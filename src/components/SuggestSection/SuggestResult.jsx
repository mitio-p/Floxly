import { useState } from 'react';
import classes from './Suggest.module.css';
import authFetch from '../../Utils/authFetch';
import { useNavigate } from 'react-router-dom';
import { getLocale } from '../../Utils/localization';

export default function SuggestResult({ account }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  async function handleFollow() {
    const response = await authFetch(`http://localhost:3000/floxly/user/follow/${account.username}`, {
      credentials: 'include',
    });

    if (response.ok) {
      setIsFollowing(true);
    }
  }

  async function handleUnfollow() {
    const response = await authFetch(`http://localhost:3000/floxly/user/unfollow/${account.username}`, {
      credentials: 'include',
    });

    if (response.ok) {
      setIsFollowing(false);
    }
  }

  return (
    <div className={classes.suggestResult}>
      <img
        src={account.profilePicture}
        alt=""
        onClick={() => {
          navigate(`/user/${account.username}`);
        }}
      />
      <div
        className={classes.suggestInfo}
        onClick={() => {
          navigate(`/user/${account.username}`);
        }}
      >
        <h2>{account.username}</h2>
        <h3>{account.fullName}</h3>
      </div>
      <button
        className={isFollowing ? classes.followingButton : classes.followButton}
        onClick={isFollowing ? handleUnfollow : handleFollow}
      >
        {isFollowing ? getLocale('unfollow') : getLocale('follow')}
      </button>
    </div>
  );
}
