import { useState } from 'react';
import classes from './Topics.module.css';
import emptyHeartIcon from '../../assets/icons/heart-empty.svg';
import fullHeartIcon from '../../assets/icons/heart-full.svg';
import commentIcon from '../../assets/icons/comment.svg';
import authFetch from '../../Utils/authFetch';
import EmojiIcon from '../../assets/icons/emoji.svg';
import EmojiPicker from 'emoji-picker-react';
import ArrowIcon from '../../assets/icons/arrowRight.svg';

export default function Topic({ topic, userData }) {
  const [likers, setLikers] = useState(topic.likers);
  const [comments, setComments] = useState(topic.comments);
  const [isCommentSectionToggled, setCommentSectionToggled] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isEmojiMenuShown, setEmojiMenuShown] = useState(false);

  console.log(comments);

  function handleTypeCommentInput(event) {
    setCommentInput(event.target.value);
  }

  function handlePickEmoji(emojiData) {
    setCommentInput((prev) => prev + emojiData.emoji);
  }

  async function handleLike() {
    const response = await authFetch(`http://localhost:3000/floxly/topic/like/${topic._id}`, {
      credentials: 'include',
      method: 'POST',
    });
    if (response.ok) {
      setLikers((prev) => [...prev, userData.user.uid]);
    }
  }
  async function handleDislike() {
    const response = await authFetch(`http://localhost:3000/floxly/topic/dislike/${topic._id}`, {
      credentials: 'include',
      method: 'POST',
    });
    if (response.ok) {
      setLikers((prev) => {
        const updatedLikers = [...prev];
        const userIndex = updatedLikers.indexOf(userData.user.uid);
        updatedLikers.splice(userIndex, 1);
        return updatedLikers;
      });
    }
  }

  async function handlePostComment() {
    const response = await authFetch(`http://localhost:3000/floxly/topic/comment/${topic._id}`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentInput }),
    });
    if (response.ok) {
      setCommentInput('');
      setComments((prev) => [response, ...prev]);
    }
  }
  return (
    <div className={classes.topic}>
      {isEmojiMenuShown && (
        <div
          className={classes.emojiMenuBackground}
          onClick={() => {
            setEmojiMenuShown(false);
          }}
        ></div>
      )}
      <div className={classes.userInfo}>
        <img src={topic.author.profilePicture} alt="" />
        <p>{topic.author.username}</p>
      </div>
      <div className={classes.topicContent}>
        <p>{topic.text}</p>
      </div>
      <div className={classes.topicActions}>
        <div className={classes.action}>
          <img
            src={likers.includes(userData.user.uid) ? fullHeartIcon : emptyHeartIcon}
            alt=""
            onClick={!likers.includes(userData.user.uid) ? handleLike : handleDislike}
          />
          <p>{likers.length}</p>
        </div>
        <div className={classes.action}>
          <img
            src={commentIcon}
            alt=""
            onClick={() => {
              setCommentSectionToggled((prev) => !prev);
            }}
          />
          <p>{comments.length}</p>
        </div>
      </div>
      {isCommentSectionToggled && (
        <div className={classes.commentSection}>
          <div className={classes.commentsContainer}>
            {comments.map((comment) => (
              <div className={classes.commentContainer}>
                <div className={classes.commentUserInfo}>
                  <img src={comment.author.profilePicture} alt="" />
                  <p>{comment.author.username}</p>
                </div>
                <p className={classes.commentContent}>{comment.text}</p>
              </div>
            ))}
            <div className={classes.inputContainer}>
              <textarea
                type="text"
                placeholder="Add comment..."
                value={commentInput}
                onChange={handleTypeCommentInput}
              ></textarea>
              <img
                src={EmojiIcon}
                alt=""
                className={classes.emojiButton}
                onClick={() => {
                  setEmojiMenuShown(true);
                }}
              />
              {commentInput.length > 0 && (
                <img src={ArrowIcon} className={classes.sendButton} onClick={handlePostComment} />
              )}
              {isEmojiMenuShown && (
                <div className={classes.emojiContainer}>
                  <EmojiPicker theme="dark" onEmojiClick={handlePickEmoji} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
