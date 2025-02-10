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

export default function UserPage() {
  const loaderData = useLoaderData();
  const userData = useContext(UserCTX);
  const navigate = useNavigate();
  const [isFollowing, setFollowing] = useState(loaderData.isFollowing);
  const [searchParams] = useSearchParams();
  const [followers, setFollowers] = useState(loaderData.user.followers.length);
  const [pictureDialog, setPictureDialog] = useState(false);
  const revalidator = useRevalidator();

  console.log(loaderData);

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
    const response = await authFetch(`http://localhost:4000/user/follow/${loaderData.user.username}`, {
      credentials: 'include',
    });
    if (response.ok) {
      revalidator.revalidate();
    }
  }
  async function handleUnfollow() {
    const response = await authFetch(`http://localhost:4000/user/unfollow/${loaderData.user.username}`, {
      credentials: 'include',
    });
    if (response.ok) {
      setFollowing(false);
      setFollowers((prev) => prev - 1);
    }
    revalidator.revalidate();
  }

  async function handleCancelRequest() {
    const response = await authFetch(`http://localhost:4000/user/cancelRequest/${loaderData.user.username}`, {
      credentials: 'include',
    });
    if (response.ok) {
      revalidator.revalidate();
    }
  }

  async function handleCreateConversation() {
    console.log(JSON.stringify(loaderData.user.uid));
    const response = await authFetch('http://localhost:5000/createConversation', {
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({ uid: loaderData.user.uid }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      navigate(`/messages/conversation/${(await response.json()).convId}`);
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
      <div className={classes.userInfo}>
        <img src={loaderData.user.profilePicture} />
        <div className={classes.userStats}>
          <div>
            <h2>{loaderData.user.username}</h2>
            {isCurrentUser ? (
              <>
                <button
                  onClick={() => {
                    navigate('/settings/edit');
                  }}
                >
                  Edit Profile
                </button>{' '}
                <button
                  onClick={() => {
                    navigate('/settings');
                  }}
                >
                  Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={isFollowing ? handleUnfollow : loaderData.isRequested ? handleCancelRequest : handleFollow}
                >
                  {isFollowing ? 'Unfollow' : loaderData.isRequested ? 'Cancel request' : 'Follow'}
                </button>
                {(!loaderData.user.privateAccount || isFollowing) && (
                  <button onClick={handleCreateConversation}>Message</button>
                )}
              </>
            )}
            {!isCurrentUser && (
              <div
                className={classes.moreOptionsButton}
                onClick={() => {
                  setOptionDialog((prev) => ({ options: prev.options, isOpen: true }));
                }}
              >
                <img src={ThreeDotsIcon} alt="" />
              </div>
            )}
          </div>
          <div>
            <h3>
              {typeof loaderData.user.gallery === 'number' ? loaderData.user.gallery : loaderData.user.gallery.length}{' '}
              Gallery
            </h3>
            <h3 style={{ cursor: 'pointer' }}>{followers} Followers</h3>
            <h3 style={{ cursor: 'pointer' }}>{loaderData.user.following.length} Following</h3>
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
        <div className={classes.divider}></div>
        <div className={classes.buttonBar}>
          <Link to="?">
            <div className={classes.buttonContainer}>
              <button>
                <img src={GalleryIcon} alt="" /> Gallery
              </button>
              {!searchParams.get('variant') && <div className={classes.indicator}></div>}
            </div>
          </Link>
          <Link to="?variant=tagged">
            <div className={classes.buttonContainer}>
              <button>
                <img src={TaggedIcon} alt="" /> Tagged
              </button>
              {searchParams.get('variant') === 'tagged' && <div className={classes.indicator}></div>}
            </div>
          </Link>
        </div>
      </div>
      {typeof loaderData.user.gallery !== 'number' ? (
        loaderData.user.gallery.length < 1 ? (
          isCurrentUser ? (
            <div className={classes.uploadPhotoSuggest}>
              <img src={CameraIcon} />
              <h1>Upload your first photo</h1>
              <h2>Share photos and memories with peoples around you! </h2>
              <p
                onClick={() => {
                  setPictureDialog(true);
                }}
              >
                Upload your photo!
              </p>
            </div>
          ) : (
            <div className={classes.uploadPhotoSuggest}>
              <img src={CameraIcon} />
              <h1>This account havent't got any public photos</h1>
            </div>
          )
        ) : (
          <PictureGrid
            pictures={loaderData.user.gallery}
            enableAddPhoto={isCurrentUser}
            onAddPhoto={() => {
              setPictureDialog(true);
            }}
          />
        )
      ) : (
        <div className={classes.uploadPhotoSuggest}>
          <img src={CameraIcon} />
          <h1>This account is private</h1>
          <h2>After the user accept your follow request you'll be able to see the gallery!</h2>
        </div>
      )}
    </main>
  );
}

export async function loader({ params }) {
  const username = params.username;
  const response = await authFetch(`http://localhost:4000/user/${username}`, { credentials: 'include' });

  if (response.ok) {
    return response;
  } else {
    throw json('User not found!', { status: 404 });
  }
}
