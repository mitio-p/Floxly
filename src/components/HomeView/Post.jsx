import classes from './Post.module.css';

import commentIcon from '../../assets/icons/comment.svg';
import emptyHeart from '../../assets/icons/heart-empty.svg';
import fullHeart from '../../assets/icons/heart-full.svg';
import { useContext, useState } from 'react';
import UserCTX from '../../Context/UserCTX';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authFetch from '../../Utils/authFetch';
import PhotoViewer from '../PhotoViewer/PhotoViewer';

export default function Post({ data }) {
  const userData = useContext(UserCTX);

  const [searchParams, setSearchParams] = useSearchParams();

  const [likersId, setLikersId] = useState(data.likersId || null);
  const isLiked = likersId && likersId.includes(userData.user.uid);

  const navigate = useNavigate();

  async function handleLike() {
    const response = await authFetch(`http://localhost:3000/floxly/photo/like/${data._id}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      setLikersId((prev) => {
        const updatedLikers = [...prev];
        updatedLikers.push(userData.user.uid);
        return updatedLikers;
      });
    }
  }

  function handleSelectPhoto() {
    setSearchParams((prevParams) => {
      prevParams.set('p', data._id);
      return prevParams;
    });
  }

  async function handleDislike() {
    const response = await authFetch(`http://localhost:3000/floxly/photo/dislike/${data._id}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      setLikersId((prev) => {
        const updatedLikers = [...prev];
        const userIndex = updatedLikers.indexOf(userData.user.uid);
        updatedLikers.splice(userIndex, 1);
        return updatedLikers;
      });
    }
  }

  return (
    <div className={classes.postContainer}>
      {searchParams.get('p') && <PhotoViewer user={userData.user} picId={searchParams.get('p')} />}
      <div className={classes.userInfo}>
        <img
          src={data.author.profilePicture}
          alt=""
          onClick={() => {
            navigate(`/user/${data.author.username}`);
          }}
        />
        <p
          onClick={() => {
            navigate(`/user/${data.author.username}`);
          }}
        >
          {data.author.username}
        </p>
      </div>
      <img className={classes.image} src={data.imgSrc} alt="" onClick={handleSelectPhoto} />
      <div className={classes.reactions}>
        <div className={classes.reactStat}>
          <img src={isLiked ? fullHeart : emptyHeart} onClick={isLiked ? handleDislike : handleLike} />
          <p>{likersId.length}</p>
        </div>
        <div className={classes.reactStat} onClick={handleSelectPhoto}>
          <img src={commentIcon} />
          {likersId && <p>{data.comments.length}</p>}
        </div>
      </div>
    </div>
  );
}
