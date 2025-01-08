import classes from './NotificationRow.module.css';

export default function NotificationRow({ data }) {
  let output;

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
            <button>Confirm</button>
            <button>Reject</button>
          </div>
        </div>
      );
  }

  return output;
}
