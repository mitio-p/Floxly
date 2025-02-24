import { useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import authFetch from '../../Utils/authFetch';
import classes from './Conversation.module.css';
import Input from '../CustomInput/Input';
import rightArrowIcon from '../../assets/icons/arrowRight.svg';
import UserCTX from '../../Context/UserCTX';
import SocketCTX from '../../Context/SocketCTX';
import seenIcon from '../../assets/icons/seen.png';
import deliveringIcon from '../../assets/icons/delivering.png';
import { getLocale } from '../../Utils/localization';
import getTimeFromMs from '../../Utils/getTimeFromMs';

export default function Conversation() {
  const loaderData = useLoaderData();
  const userData = useContext(UserCTX);
  const socket = useContext(SocketCTX);
  const [isRecieverTyping, setRecieverTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messageContainer = useRef();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(loaderData.messages);
  const navigate = useNavigate();

  function handleTyping(event) {
    setMessageInput(event.target.value);
    socket.emit('typing', { convId: loaderData.id });
  }

  function handleScrollDown() {
    messageContainer.current.scrollTo({
      top: messageContainer.current.scrollHeight,
      behavior: 'instant',
    });
  }

  async function handleSendMessage() {
    setMessageInput('');

    const newMessage = {
      type: 'text',
      author: userData.user.uid,
      text: messageInput,
      dateSent: Date.now(),
      sequenceNumber: messages.length,
      isSeen: false,
      isEdited: false,
      isDelivered: false,
    };

    setMessages((prev) => {
      const updatedMessages = [...prev];
      updatedMessages.push(newMessage);
      return updatedMessages;
    });

    socket.emit('send-message', { ...newMessage, room: loaderData.id });

    const response = await authFetch(`http://localhost:5000/send-message/${loaderData.id}`, {
      method: 'POST',
      body: JSON.stringify(newMessage),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const messageIndex = updatedMessages.indexOf(newMessage);
        updatedMessages[messageIndex].isDelivered = true;
        return updatedMessages;
      });
    }
  }

  useEffect(() => {
    socket.on('typing', (convId) => {
      console.log(convId);
      if (convId === loaderData.id) {
        handleScrollDown();
        setRecieverTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          console.log(isRecieverTyping);
          setRecieverTyping(false);
        }, 700);
      }
    });

    socket.on('recieve-message', (data) => {
      if (data.room === loaderData.id) {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages.push(data);
          return updatedMessages;
        });
      }
    });

    return () => {
      socket.off('recieve-message');
      socket.off('typing');
      clearTimeout(typingTimeoutRef.current);
    };
  }, [socket]);

  useEffect(() => {
    handleScrollDown();
  }, [messages]);

  return (
    <div className={classes.conversationContainer}>
      <header>
        <div className={classes.userInfo}>
          <img src={loaderData.reciever.profilePicture} alt="" />
          <h1
            onClick={() => {
              navigate(`/user/${loaderData.reciever.username}`);
            }}
          >
            {loaderData.reciever.username}
          </h1>
        </div>
      </header>
      <div className={classes.messagesContainer} ref={messageContainer}>
        {[...messages].reverse().map((message) => (
          <div
            key={message.dateSent}
            style={
              message.author === userData.user.uid
                ? { display: 'flex', justifyContent: 'end', width: '99%' }
                : { display: 'flex', justifyContent: 'start', width: '99%' }
            }
          >
            <div
              className={classes.message}
              style={
                message.author === userData.user.uid
                  ? {
                      backgroundColor: 'var(--foreground-color)',
                    }
                  : {
                      backgroundColor: 'rgb(38,38,38)',
                      color: 'white',
                    }
              }
            >
              {message.text}
              {message.isSeen && message.author === userData.user.uid && (
                <img className={classes.messageStatus} src={seenIcon} />
              )}
              <div className={classes.messageDetails}>
                {!message.isDelivered && (
                  <div>
                    <img src={deliveringIcon} />
                  </div>
                )}
                {getTimeFromMs(message.dateSent)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {isRecieverTyping && (
        <div style={{ width: '95%', display: 'flex', justifyContent: 'start', marginBottom: '10px' }}>
          <div className={classes.typingContainer}>{getLocale('typing')}</div>
        </div>
      )}
      <div className={classes.inputContainer}>
        <textarea type="text" placeholder={getLocale('type_message')} onChange={handleTyping} value={messageInput} />
        {messageInput.length > 0 && (
          <button onClick={handleSendMessage}>
            <img src={rightArrowIcon} alt="" />
          </button>
        )}
      </div>
    </div>
  );
}

export async function loader({ params }) {
  console.log('askhjd');
  const response = await authFetch('http://localhost:5000/conversation', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({ convId: params.convId }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return response;
  } else {
    return { status: response.status };
  }
}
