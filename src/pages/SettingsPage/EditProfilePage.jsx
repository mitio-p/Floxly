import { useContext, useEffect, useRef, useState } from 'react';
import Input from '../../components/CustomInput/Input';
import classes from './EditProfilePage.module.css';
import UserCTX from '../../Context/UserCTX';
import NotificationCTX from '../../Context/NotificationCTX';

import trashIcon from '../../assets/icons/delete.png';
import { Form, useActionData, useNavigate } from 'react-router-dom';
import authFetch from '../../Utils/authFetch';
import { getLocale } from '../../Utils/localization';

const acceptedImageTypes = ['jpeg', 'png', 'jpg'];
const maxFileSize = 4194304;

export default function EditProfilePage() {
  const userData = useContext(UserCTX);
  const setNotification = useContext(NotificationCTX);
  const [currentPhoto, setCurrentPhoto] = useState();

  const photoInputRef = useRef();
  const usernameInputRef = useRef();
  const fullnameInputRef = useRef();
  const bioInputRef = useRef();
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.success) {
      setNotification(actionData.success.message);
      navigate('/settings');
    } else if (actionData?.error) {
      setNotification(actionData.error.message);
    }
  }, [actionData, navigate]);

  const [isPictureHovered, setPictureHovered] = useState(false);

  function handleUploadPhoto(event) {
    if (event.target.value) {
      if (acceptedImageTypes.includes(event.target.files[0].type.split('/')[1])) {
        if (event.target.files[0].size < maxFileSize) {
          const blob = new Blob([event.target.files[0]], { type: event.target.files[0].type });
          const photoURL = URL.createObjectURL(blob);
          setCurrentPhoto({ url: photoURL, file: event.target.files[0] });
        } else {
          setNotification('The image exceeded maximum size!');
          event.target.value = '';
        }
      } else {
        setNotification('Invalid image format!');
        event.target.value = '';
      }
    }
  }

  function handleRemovePhoto() {
    setCurrentPhoto(null);
    setPictureHovered(false);
    photoInputRef.current.value = '';
  }

  return (
    <main className={classes.globalContainer}>
      <Form method="POST" className={classes.optionsContainer} encType="multipart/form-data">
        <h1>{getLocale('edit_profile')}</h1>
        <div className={classes.photoOptionContainer}>
          <div
            className={classes.fileInputContainer}
            onMouseEnter={() => {
              currentPhoto ? setPictureHovered(true) : undefined;
            }}
            onMouseLeave={() => {
              setPictureHovered(false);
            }}
          >
            <input onChange={handleUploadPhoto} id="profilePictureInput" type="file" ref={photoInputRef} name="photo" />
            <img src={!currentPhoto ? userData.user.profilePicture : currentPhoto.url} alt="" />
            {isPictureHovered && (
              <div className={classes.deletePhotoSuggest}>
                <img src={trashIcon} onClick={handleRemovePhoto} />
              </div>
            )}
          </div>
          <label htmlFor="profilePictureInput">{getLocale('change_photo')}</label>
        </div>
        <Input
          label={getLocale('username')}
          maxCharacters={16}
          enableCounter={true}
          name="username"
          errorMessage={actionData?.errors?.username}
          ref={usernameInputRef}
        />
        <Input
          label={getLocale('fullname')}
          maxCharacters={50}
          enableCounter={true}
          name="fullName"
          ref={fullnameInputRef}
        />
        <Input
          label={getLocale('bio')}
          maxCharacters={150}
          enableCounter={true}
          name="bio"
          isTextArea={true}
          enableEmoji={true}
          ref={bioInputRef}
        />
        <button className="btn1" style={{ position: 'absolute', right: 0, bottom: '-60px', width: 150 }}>
          {getLocale('submit')}
        </button>
      </Form>
    </main>
  );
}

export async function action({ request }) {
  const fd = await request.formData();
  const response = await authFetch('http://localhost:4000/user/updateUserInfo', {
    credentials: 'include',
    method: 'POST',
    body: fd,
  });

  return response;
}
