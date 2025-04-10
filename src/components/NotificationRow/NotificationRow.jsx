import classes from './NotificationRow.module.css';
import authFetch from '../../Utils/authFetch';
import { useRevalidator } from 'react-router-dom';

export default function NotificationRow({ data }) {
  let output;

  const revalidator = useRevalidator();

  async function handleConfirm() {
    const response = await authFetch('http://localhost:3000/floxly/user/acceptFollowRequest', {
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({ id: data.from.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    revalidator.revalidate();
  }

  async function handleReject() {
    const response = await authFetch('http://localhost:3000/floxly/user/rejectFollowRequest', {
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({ id: data.from.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    revalidator.revalidate();
  }

  switch (data.type) {
    case 'followRequest':
      output = (
        <div
          className={classes.notificationContainerFollowRequest}
          style={!data.isRead ? { backgroundColor: 'rgba(164, 211, 177, 0.18)' } : undefined}
        >
          <img src={data.from.profilePicture} />
          <div>
            <p>
              <span style={{ fontWeight: '600' }}>{data.from.username}</span> requested to follow you
            </p>
          </div>
          <div className={classes.buttonContainer}>
            <button onClick={handleConfirm}>Confirm</button>
            <button onClick={handleReject}>Reject</button>
          </div>
        </div>
      );
  }

  return output;
}
