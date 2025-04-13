import { useContext, useEffect, useRef, useState } from 'react';
import classes from './Topics.module.css';
import UserCTX from '../../Context/UserCTX';
import emojyIcon from '../../assets/icons/emoji.svg';
import EmojiPicker from 'emoji-picker-react';
import authFetch from '../../Utils/authFetch';

export default function Topics() {
  const userData = useContext(UserCTX);
  const textAreaRef = useRef();
  const [isEmojiMenuShown, setEmojiMenuShown] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState([]);

  function handleInput(event) {
    const textarea = textAreaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    setTopicInput(event.target.value);
  }

  function handlePickEmoji(emojiData) {
    setTopicInput((prev) => prev + emojiData.emoji);
  }

  async function handlePostTopic() {
    const response = await authFetch('http://localhost:3000/floxly/user/upload-topic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ text: topicInput.trim() }),
    });

    if (response.ok) {
      setTopicInput('');
      textAreaRef.current.style.height = '18px';
      setTopics((prev) => [
        ...prev,
        {
          author: { username: userData.user.username, profilePicture: userData.user.profilePicture },
          text: topicInput,
        },
      ]);
    }
  }

  async function handleFetchTopics() {
    const response = await authFetch('http://localhost:3000/floxly/user/fetch/topics', { credentials: 'include' });

    if (response.ok) {
      setTopics(await response.json());
    }
  }

  useEffect(() => {
    handleFetchTopics();
  }, []);

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
            maxLength={500}
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
          disabled={topicInput.length < 1}
          onClick={handlePostTopic}
        >
          Post
        </button>
      </div>
      {topics.map((topic) => (
        <div className={classes.topic}>
          <div className={classes.userInfo}>
            <img src={topic.author.profilePicture} alt="" />
            <p>{topic.author.username}</p>
          </div>
          <div className={classes.topicContent}>
            <p>{topic.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
