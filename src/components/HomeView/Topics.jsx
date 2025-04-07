import { useContext, useRef, useState } from 'react';
import classes from './Topics.module.css';
import UserCTX from '../../Context/UserCTX';
import emojyIcon from '../../assets/icons/emoji.svg';
import EmojiPicker from 'emoji-picker-react';

export default function Topics() {
  const userData = useContext(UserCTX);
  const textAreaRef = useRef();
  const [isEmojiMenuShown, setEmojiMenuShown] = useState(false);
  const [topicInput, setTopicInput] = useState('');

  function handleInput(event) {
    const textarea = textAreaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    setTopicInput(event.target.value);
  }

  function handlePickEmoji(emojiData) {
    setTopicInput((prev) => prev + emojiData.emoji);
  }

  return (
    <div className={classes.topics}>
      <div className={classes.createTopic}>
        <div className={classes.userInfo}>
          <img src={userData.user.profilePicture} alt="" />
          <p>{userData.user.username}</p>
        </div>
        <div className={classes.topicInput}>
          <textarea
            type="text"
            placeholder="What's new?"
            ref={textAreaRef}
            onChange={handleInput}
            rows="1"
            value={topicInput}
          />
          <img
            src={emojyIcon}
            alt=""
            onClick={() => {
              setEmojiMenuShown(true);
            }}
          />
          {isEmojiMenuShown && (
            <div
              className={classes.emojiMenuBackground}
              onClick={() => {
                setEmojiMenuShown(false);
              }}
            ></div>
          )}
          {isEmojiMenuShown && (
            <div className={classes.emojiMenu}>
              <EmojiPicker theme="dark" onEmojiClick={handlePickEmoji} />
            </div>
          )}
        </div>
        <button
          className={classes.post}
          style={topicInput.length < 1 ? { color: 'grey', cursor: 'default' } : undefined}
        >
          Post
        </button>
      </div>
    </div>
  );
}
