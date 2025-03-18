import { useSearchParams } from 'react-router-dom';
import classes from './PhotoViewer.module.css';
import { useContext, useEffect, useState } from 'react';
import authFetch from '../../Utils/authFetch';

import emptyHeartIcon from '../../assets/icons/heart-empty.svg';
import fullHeartIcon from '../../assets/icons/heart-full.svg';
import comment from '../../assets/icons/comment.svg';
import UserCTX from '../../Context/UserCTX';
import EmojiIcon from '../../assets/icons/emoji.svg';
import starIcon from '../../assets/icons/star.svg';

import EmojiPickerReact from 'emoji-picker-react';

import Input from '../CustomInput/Input';
import rightArrowIcon from '../../assets/icons/arrowRight.svg';
import closeIcon from '../../assets/icons/close.svg';
import Comment from '../Comment/Comment';

export default function PhotoViewer({ user, picId }) {
  const [photo, setPhoto] = useState();
  const [error, setError] = useState(false);
  const userData = useContext(UserCTX);
  const [searchParams, setSearchParams] = useSearchParams();

  const [likersId, setLikersId] = useState([]);
  const [comments, setComments] = useState([]);

  const [isEmojiMenuShown, setEmojiMenuShow] = useState(false);

  const isLiked = likersId && likersId.includes(userData.user.uid);

  const [commentInput, setCommentInput] = useState('');

  console.log(comments);

  async function handleFetchPhoto() {
    const response = await authFetch(`http://localhost:4000/photo/${picId}`, {
      credentials: 'include',
    });

    if (response.ok) {
      setPhoto(await response.json());
    } else {
      setError(true);
    }
  }

  function handleTypeCommentInput(event) {
    setCommentInput(event.target.value);
  }

  function handlePickEmoji(emojiData) {
    setCommentInput((prev) => prev + emojiData.emoji);
  }

  async function handleLike() {
    const response = await authFetch(`http://localhost:4000/photo/like/${searchParams.get('p')}`, {
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

  async function handleDislike() {
    const response = await authFetch(`http://localhost:4000/photo/dislike/${searchParams.get('p')}`, {
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

  function handleClose() {
    setSearchParams((prev) => prev.delete('p'));
  }

  async function handleComment() {
    const response = await authFetch(`http://localhost:4000/photo/${picId}/comment`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ text: commentInput }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      setCommentInput('');
      const data = await response.json();
      setComments((prev) => {
        const updatedComments = [...prev];
        updatedComments.unshift(data);
        return updatedComments;
      });
    }
  }

  useEffect(() => {
    handleFetchPhoto();
  }, []);

  useEffect(() => {
    setLikersId(photo?.likersId || []);
    setComments(photo?.comments || []);
  }, [photo]);

  return (
    <div className={classes.viewerContainer}>
      <div className={classes.close} onClick={handleClose}>
        <img src={closeIcon} alt="" />
      </div>
      {isEmojiMenuShown && (
        <div
          className={classes.emojiMenuBackground}
          onClick={() => {
            setEmojiMenuShow(false);
          }}
        ></div>
      )}
      <div className={classes.photoContent}>
        <div className={classes.imageContainer}>
          <img src={photo?.imgSrc} alt="" />
        </div>
        <div className={classes.infoContainer}>
          <div className={classes.userInfo}>
            <img className={classes.profilePicture} src={user.profilePicture} alt="" />
            <div>
              <h2>{user.username}</h2>
              {photo?.location && <h3>{photo?.location}</h3>}
            </div>
            {photo?.isBestFriendsOnly && <img className={classes.bestFriendsOnlyBadge} src={starIcon} alt="" />}
          </div>
          <div className={classes.commentSection}>
            {comments.length < 1 ? (
              <div className={classes.noCommentContainer}>
                <h1>No comments yet!</h1>
                <h2>Be the first who will write a comment!</h2>
              </div>
            ) : (
              comments.map((commentData) => <Comment key={commentData.dateSent} data={commentData} picId={picId} />)
            )}
          </div>
          <div className={classes.pictureReactions}>
            <div className={classes.reactStat}>
              <img
                src={isLiked ? fullHeartIcon : emptyHeartIcon}
                alt=""
                onClick={!isLiked ? handleLike : handleDislike}
              />
              <p>{likersId && likersId.length}</p>
            </div>
            <div className={classes.reactStat}>
              <img src={comment} alt="" />
              <p>{comments && comments.length}</p>
            </div>
          </div>
          <div className={classes.inputContainer}>
            <textarea type="text" placeholder="Add comment..." value={commentInput} onChange={handleTypeCommentInput} />
            <img
              src={EmojiIcon}
              alt=""
              onClick={() => {
                setEmojiMenuShow((prev) => !prev);
              }}
            />
            {isEmojiMenuShown && (
              <div className={classes.emojiMenu}>
                <EmojiPickerReact theme="dark" onEmojiClick={handlePickEmoji} />
              </div>
            )}
            {commentInput.length > 0 && (
              <button className={classes.sendButton} onClick={handleComment}>
                <img src={rightArrowIcon} alt="" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
