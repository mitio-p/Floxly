import { json, Link, useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import classes from './UserPage.module.css';
import { useContext, useState } from 'react';
import UserCTX from '../../Context/UserCTX';
import ThreeDotsIcon from '../../assets/icons/threeDots.svg';
import GalleryIcon from '../../assets/icons/gallery.svg';
import TaggedIcon from '../../assets/icons/tagged.svg';
import OptionsDialog from '../../components/Dialogs/OptionsDialog.jsx';
import CameraIcon from '../../assets/icons/camera.svg';
import PictureDialog from '../../components/Dialogs/PictureDialog.jsx';
import tokenSevice from '../../Utils/tokenService.js';
import authFetch from '../../Utils/authFetch.js';
import PictureGrid from '../../components/PictureGrid/PictureGrid.jsx';
import { getLocale } from '../../Utils/localization.js';
import PhotoViewer from '../../components/PhotoViewer/PhotoViewer.jsx';
import SocketCTX from '../../Context/SocketCTX.jsx';
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog.jsx';

export default function UserPage() {
  const loaderData = useLoaderData();
  const userData = useContext(UserCTX);
  const navigate = useNavigate();
  const [isFollowing, setFollowing] = useState(loaderData.isFollowing);
  const [isRequested, setRequested] = useState(loaderData.isRequested);
  const [searchParams, setSearchParams] = useSearchParams();
  const [followers, setFollowers] = useState(loaderData.user.followers.length);
  const [pictureDialog, setPictureDialog] = useState(false);
  const [confirmDialogText, setConfirmDialogText] = useState('');
  const [isDeactivated, setDeactivated] = useState(loaderData.user.isDeactivated);

  const socket = useContext(SocketCTX);

  const [optionDialog, setOptionDialog] = useState({
    options: [
      {
        title: 'Block',
        isDangerous: true,
        clickFN: (close) => {
          console.log('block');
          close();
        },
      },
      { title: 'Share' },
      { title: 'Cancel', type: 'cancel' },
    ],
    isOpen: false,
  });

  const isCurrentUser = userData.user.username === loaderData.user.username;

  async function handleFollow() {
    const response = await authFetch(`http://localhost:3000/floxly/user/follow/${loaderData.user.username}`, {
      credentials: 'include',
    });
    if (response.ok) {
      if (loaderData.user.privateAccount) {
        setRequested(true);
      } else {
        setFollowers((prev) => prev + 1);
        setFollowing(true);
      }
    }
  }
  async function handleUnfollow() {
    const response = await authFetch(`http://localhost:3000/floxly/user/unfollow/${loaderData.user.username}`, {
      credentials: 'include',
    });
    if (response.ok) {
      setFollowing(false);
      setFollowers((prev) => prev - 1);
    }
    revalidator.revalidate();
  }

  async function handleCancelRequest() {
    const response = await authFetch(`http://localhost:3000/floxly/user/cancelRequest/${loaderData.user.username}`, {
      credentials: 'include',
    });
    if (response.ok) {
      setRequested(false);
    }
  }

  async function handleCreateConversation() {
    const response = await authFetch('http://localhost:3000/createConversation', {
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({ uid: loaderData.user.uid }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const convId = (await response.json()).convId;
      socket.emit('join_conversation', convId);
      navigate(`/messages/conversation/${convId}`);
    }
  }

  function handleSelectPhoto(picId) {
    setSearchParams((prev) => {
      prev.set('p', picId);
      return prev;
    });
  }

  async function handleDeactivateAccount() {
    const response = await authFetch('http://localhost:3000/floxly/user/deactivate', {
      method: 'POST',
      body: JSON.stringify({ id: loaderData.user.uid }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      setDeactivated(true);
      setConfirmDialogText('');
    }
  }

  async function handleActivateAccount() {
    const response = await authFetch('http://localhost:3000/floxly/user/activate', {
      method: 'POST',
      body: JSON.stringify({ id: loaderData.user.uid }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      setDeactivated(false);
    }
  }

  return (
    <main className={classes.userContainer}>
      <OptionsDialog options={optionDialog.options} isOpen={optionDialog.isOpen} setOpen={setOptionDialog} />
      <PictureDialog
        isOpen={pictureDialog}
        onClose={() => {
          setPictureDialog(false);
        }}
      />
      {searchParams.get('p') && <PhotoViewer user={loaderData.user} picId={searchParams.get('p')} />}
      {confirmDialogText.length > 0 && (
        <ConfirmDialog
          isDangerous={true}
          text={confirmDialogText}
          onCancel={() => {
            setConfirmDialogText('');
          }}
          onConfirm={handleDeactivateAccount}
        />
      )}
      <div className={classes.userInfo}>
        <img src={loaderData.user.profilePicture} />
        <div className={classes.userStats}>
          <div>
            <h2>{loaderData.user.username}</h2>
            {isCurrentUser ? (
              <>
                <button
                  className={classes.userButtons}
                  onClick={() => {
                    navigate('/settings/edit');
                  }}
                >
                  {getLocale('edit_profile')}
                </button>{' '}
                <button
                  className={classes.userButtons}
                  onClick={() => {
                    navigate('/settings');
                  }}
                >
                  {getLocale('settings')}
                </button>
              </>
            ) : (
              <>
                <button
                  className={classes.userButtons}
                  onClick={isFollowing ? handleUnfollow : isRequested ? handleCancelRequest : handleFollow}
                  disabled={isDeactivated}
                >
                  {isFollowing
                    ? getLocale('unfollow')
                    : isRequested
                    ? getLocale('cancel_request')
                    : getLocale('follow')}
                </button>
                {(!loaderData.user.privateAccount || isFollowing) && (
                  <button className={classes.userButtons} onClick={handleCreateConversation} disabled={isDeactivated}>
                    {getLocale('message')}
                  </button>
                )}
                {userData.user.role === 'admin' &&
                  userData.user.uid !== loaderData.user.uid &&
                  (isDeactivated ? (
                    <button className={classes.activateButton} onClick={handleActivateAccount}>
                      Activate account
                    </button>
                  ) : (
                    <button
                      className={classes.deactivateButton}
                      onClick={() => {
                        setConfirmDialogText('Are you sure you want to deactivate this account ?');
                      }}
                    >
                      Deactivate account
                    </button>
                  ))}
              </>
            )}
            {!isCurrentUser && (
              <div
                className={classes.moreOptionsButton}
                onClick={() => {
                  setOptionDialog((prev) => ({
                    options: prev.options,
                    isOpen: true,
                  }));
                }}
              >
                <img src={ThreeDotsIcon} alt="" />
              </div>
            )}
          </div>
          <div>
            <h3>
              {loaderData.user.photosCount} {getLocale('gallery')}
            </h3>
            <h3 style={{ cursor: 'pointer' }}>
              {followers} {getLocale('followers')}
            </h3>
            <h3 style={{ cursor: 'pointer' }}>
              {loaderData.user.following.length} {getLocale('following')}
            </h3>
          </div>
          <div>
            <h3>{loaderData.user.fullName}</h3>
          </div>
          <div>
            <p>{loaderData.user.bio}</p>
          </div>
        </div>
      </div>
      <div className={classes.dividerContainer}>
        {isDeactivated && <p className={classes.deactivatedAccountText}>This account is deactivated!</p>}
        <div className={classes.divider}></div>
        <div className={classes.buttonBar}>
          <div className={classes.buttonContainer}>
            <button>
              <img src={GalleryIcon} alt="" /> {getLocale('gallery')}
            </button>
          </div>
        </div>
      </div>

      {isCurrentUser ? (
        loaderData.user.photosCount < 1 ? (
          <div className={classes.uploadPhotoSuggest}>
            <img src={CameraIcon} />
            <h1>{getLocale('upload_first_photo')}</h1>
            <h2>{getLocale('share_photos_memories')}</h2>
            <p
              onClick={() => {
                setPictureDialog(true);
              }}
            >
              {getLocale('upload_photo')}
            </p>
          </div>
        ) : (
          <PictureGrid
            pictures={loaderData.user.gallery}
            enableAddPhoto={isCurrentUser}
            onAddPhoto={() => {
              setPictureDialog(true);
            }}
            onSelectPhoto={handleSelectPhoto}
          />
        )
      ) : loaderData.user.privateAccount && !loaderData.user.followers.includes(userData.user.uid) ? (
        <div className={classes.uploadPhotoSuggest}>
          <img src={CameraIcon} />
          <h1>{getLocale('account_is_private')}</h1>
          <h2>{getLocale('private_account_description')}</h2>
        </div>
      ) : loaderData.user.photosCount < 1 ? (
        <div className={classes.uploadPhotoSuggest}>
          <img src={CameraIcon} />
          <h1>{getLocale('account_no_photos')}</h1>
        </div>
      ) : (
        <PictureGrid
          pictures={loaderData.user.gallery}
          enableAddPhoto={isCurrentUser}
          onAddPhoto={() => {
            setPictureDialog(true);
          }}
          onSelectPhoto={handleSelectPhoto}
        />
      )}
    </main>
  );
}

export async function loader({ params }) {
  const username = params.username;
  const response = await authFetch(`http://localhost:3000/floxly/user/${username}`, {
    credentials: 'include',
  });

  if (response.ok) {
    return response;
  } else {
    throw json('User not found!', { status: 404 });
  }
}
