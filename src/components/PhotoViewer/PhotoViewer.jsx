import { useSearchParams } from 'react-router-dom';
import classes from './PhotoViewer.module.css';
import { useContext, useEffect, useState } from 'react';
import authFetch from '../../Utils/authFetch';

import emptyHeartIcon from '../../assets/icons/heart-empty.svg';
import fullHeartIcon from '../../assets/icons/heart-full.svg';
import UserCTX from '../../Context/UserCTX';

export default function PhotoViewer({ user, picId }) {
  const [photo, setPhoto] = useState();
  const [error, setError] = useState(false);
  const userData = useContext(UserCTX);

  const [likersId, setLikersId] = useState([]);

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

  useEffect(() => {
    handleFetchPhoto();
  }, []);

  useEffect(() => {
    setLikersId(photo?.likersId);
  }, [photo]);

  return (
    <div className={classes.viewerContainer}>
      <div className={classes.photoContent}>
        <div className={classes.imageContainer}>
          <img src={photo?.imgSrc} alt="" />
        </div>
        <div className={classes.infoContainer}>
          <div className={classes.userInfo}>
            <img src={user.profilePicture} alt="" />
            <div>
              <h2>{user.username}</h2>
              {photo?.location && <h3>{photo?.location}</h3>}
            </div>
          </div>
          <div className={classes.commentSection}></div>
          <div className={classes.pictureReactions}>
            <div className={classes.reactStat}>
              <img alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
