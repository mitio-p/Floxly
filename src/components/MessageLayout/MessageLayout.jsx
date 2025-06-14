import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import classes from './MessageLayout.module.css';
import authFetch from '../../Utils/authFetch';
import { useContext, useEffect, useState } from 'react';
import SocketCTX from '../../Context/SocketCTX';
import UserCTX from '../../Context/UserCTX';
import nextIcon from '../../assets/icons/next.png';
import leftArrow from '../../assets/icons/left-arrow.png';
import { getLocale } from '../../Utils/localization';

export default function MessageLayout() {
  const navigate = useNavigate();
  const params = useParams();
  const userData = useContext(UserCTX);

  const [isRetracted, setRetracted] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const location = useLocation();

  console.log(location.pathname);

  function resize() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', resize);
  }, []);

  return (
    <main className={classes.inboxContainer}>
      {location.pathname.includes('conversation') &&
      width < 806 ? null : isRetracted ? (
        <div className={classes.extendIcon}>
          <img
            src={nextIcon}
            alt=''
            onClick={() => {
              setRetracted(false);
            }}
          />
        </div>
      ) : (
        <aside className={classes.listContainer}>
          {width > 806 && (
            <div className={classes.retractIcon}>
              <img
                src={nextIcon}
                alt=''
                onClick={() => {
                  setRetracted(true);
                }}
              />
            </div>
          )}
          <h1>{getLocale('messages')}</h1>
          <div className={classes.conversationsList}>
            {userData.user.conversations &&
              userData.user.conversations.map((conv) => {
                return (
                  <div
                    key={conv._id}
                    className={classes.convRow}
                    onClick={() => {
                      navigate(`/messages/conversation/${conv._id}`);
                    }}
                  >
                    <img src={conv.reciever.profilePicture} alt='' />
                    <div className={classes.convInfo}>
                      <h2>{conv.reciever.username}</h2>
                      <h3>
                        {conv.lastMessage &&
                          (conv.lastMessage?.text.length < 25
                            ? conv.lastMessage?.text
                            : conv.lastMessage?.text.substr(0, 25) + '...')}
                      </h3>
                    </div>
                  </div>
                );
              })}
          </div>
        </aside>
      )}

      <Outlet key={params.convId} />
    </main>
  );
}
