import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
import ConfirmDialog from '../Dialogs/ConfirmDialog';

import DeleteIcon from '../../assets/icons/delete.png';
import { getLocale } from '../../Utils/localization';

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

  const [isDeactivated, setDeactivated] = useState(false);

  const [confirmDialogText, setConfirmDialogText] = useState({ text: '', action: () => {} });

  const navigate = useNavigate();
  const location = useLocation();

  async function handleFetchPhoto() {
    const response = await authFetch(`http://localhost:3000/floxly/photo/${picId}`, {
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
    const response = await authFetch(`http://localhost:3000/floxly/photo/like/${searchParams.get('p')}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok && likersId) {
      setLikersId((prev) => {
        const updatedLikers = [...prev];
        updatedLikers.push(userData.user.uid);
        return updatedLikers;
      });
    }
  }

  async function handleDislike() {
    const response = await authFetch(`http://localhost:3000/floxly/photo/dislike/${searchParams.get('p')}`, {
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
    const response = await authFetch(`http://localhost:3000/floxly/photo/${picId}/comment`, {
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

  async function handleDeactivatePhoto() {
    const response = await authFetch('http://localhost:3000/floxly/photo/deactivate', {
      method: 'POST',
      body: JSON.stringify({ id: photo._id }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      setDeactivated(true);
      setConfirmDialogText({ text: '', action: () => {} });
    }
  }

  async function handleActivatePhoto() {
    const response = await authFetch('http://localhost:3000/floxly/photo/activate', {
      method: 'POST',
      body: JSON.stringify({ id: photo._id }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      setDeactivated(false);
    }
  }

  async function handleDeletePhoto() {
    const response = await authFetch(`http://localhost:3000/floxly/photo/${photo?._id}/delete`, {
      credentials: 'include',
      method: 'DELETE',
    });

    if (response.ok) {
      navigate(location.pathname, { replace: true });
    }
  }

  useEffect(() => {
    handleFetchPhoto();
  }, []);

  useEffect(() => {
    setLikersId(photo?.likersId || null);
    setComments(photo?.comments || []);
    setDeactivated(photo?.isDeactivated || false);
  }, [photo]);

  return (
    <div className={classes.viewerContainer}>
      {confirmDialogText.text.length > 0 && (
        <ConfirmDialog
          isDangerous={true}
          text={confirmDialogText.text}
          onCancel={() => {
            setConfirmDialogText({ text: '', action: () => {} });
          }}
          onConfirm={confirmDialogText.action}
        />
      )}
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

            {userData.user.role === 'admin' &&
              (isDeactivated ? (
                <button className={classes.activateButton} onClick={handleActivatePhoto}>
                  Activate photo
                </button>
              ) : (
                <button
                  className={classes.deactivateButton}
                  onClick={() => {
                    setConfirmDialogText({
                      text: 'Are you sure you want to deactivate this photo?',
                      action: handleDeactivatePhoto,
                    });
                  }}
                >
                  Deactivate photo
                </button>
              ))}
            {userData.user.uid === photo?.author && (
              <img
                src={DeleteIcon}
                className={classes.delete}
                onClick={() => {
                  setConfirmDialogText({
                    text: 'Are you sure you want to delete this photo?',
                    action: handleDeletePhoto,
                  });
                }}
              />
            )}
          </div>
          <div className={classes.commentSection}>
            {comments.length < 1 ? (
              <div className={classes.noCommentContainer}>
                <h1>{getLocale('no_comments_yet')}</h1>
                <h2>{getLocale('be_first_to_comment')}</h2>
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
