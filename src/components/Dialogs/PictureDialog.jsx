import { createPortal } from 'react-dom';
import classes from './PictureDialog.module.css';
import ImageIcon from '../../assets/icons/image.svg';
import { useContext, useEffect, useState } from 'react';
import NotificationCTX from '../../Context/NotificationCTX';
import Input from '../CustomInput/Input.jsx';
import SwitchInput from '../CustomInput/SwitchInput.jsx';
import CloseIcon from '../../assets/icons/close.svg';
import { redirect, useActionData, useNavigate, useSubmit } from 'react-router-dom';
import authFetch from '../../Utils/authFetch.js';

const acceptedImageTypes = ['jpeg', 'png', 'jpg'];
const maxFileSize = 8388608; // 8MB

export default function PictureDialog({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState();
  const [dialogTitle, setDialogTitle] = useState('Upload photo');

  const [isBestFriendsOnly, setBestFriendsOnly] = useState(false);
  const [isLikesHidden, setLikesHidden] = useState(false);
  const [isCommentsOff, setCommentsOff] = useState(false);

  const actionData = useActionData();

  const submit = useSubmit();

  const navigate = useNavigate();

  const setNotification = useContext(NotificationCTX);
  function handleUploadPhoto(event) {
    if (event.target.value) {
      const file = event.target.files[0];

      if (acceptedImageTypes.includes(file.type.split('/')[1])) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const image = new Image();
          image.src = e.target.result;

          image.onload = () => {
            const width = image.width;
            const height = image.height;

            if (width >= 350 && height >= 350) {
              if (file.size < maxFileSize) {
                const blob = new Blob([file], { type: file.type });
                const photoURL = URL.createObjectURL(blob);

                console.log(file);
                setCurrentPhoto({ url: photoURL, file });
                setCurrentStep((prevStep) => prevStep + 1);
              } else {
                setNotification('The image exceeded maximum size!');
                event.target.value = '';
              }
            } else {
              setNotification("Image's width and height must be at least 350px!");
              event.target.value = '';
            }
          };
        };

        reader.readAsDataURL(file);
      } else {
        setNotification('Invalid image format!');
        event.target.value = '';
      }
    }
  }

  function handlePublish(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    fd.append('bestFriendsOnly', isBestFriendsOnly);
    fd.append('isLikesCountHidden', isLikesHidden);
    fd.append('isCommentsOff', isCommentsOff);
    fd.append('photoFile', currentPhoto.file);
    submit(fd, { method: 'post', encType: 'multipart/form-data' });
  }

  useEffect(() => {
    switch (currentStep) {
      case 0:
        setDialogTitle('Upload photo');
        break;
      case 1:
        setDialogTitle('Details');
        break;
    }
  }, [currentStep]);

  useEffect(() => {
    if (actionData?.success) {
      onClose();
    }
  }, [actionData]);

  useEffect(() => {
    setCurrentStep(0);
  }, [isOpen]);

  const firstStep = (
    <div className={classes.firstStep}>
      <img src={ImageIcon} />
      <h3>Drag your photo here!</h3>
      <input type="file" onChange={handleUploadPhoto} id="photoInput" />
      <label htmlFor="photoInput">Browse photo...</label>
    </div>
  );

  const secondStep = (
    <div className={classes.secondStep}>
      <img src={currentPhoto?.url} />
      <form onSubmit={handlePublish}>
        <Input label="Add text" name="text" />
        <Input label="Add location" name="location" />
        <Input label="Tag people" name="tagged" />
        <div className={classes.extraOptions}>
          <SwitchInput label="Best friends only" onInputChange={setBestFriendsOnly} />
          <SwitchInput label="Hide likes count" onInputChange={setLikesHidden} />
          <SwitchInput label="Turn off comments" onInputChange={setCommentsOff} />
        </div>
        <button className="btn1">Upload</button>
      </form>
    </div>
  );

  let currentStepElement;

  switch (currentStep) {
    case 0:
      currentStepElement = firstStep;
      break;
    case 1:
      currentStepElement = secondStep;
      break;
  }

  if (isOpen) {
    return createPortal(
      <div className={classes.dialogContainer}>
        <div className={classes.closeContainer} onClick={onClose}>
          <img src={CloseIcon} alt="" />
        </div>
        <div className={classes.dialogContentContainer}>
          <div className={classes.dialogTitle}>
            {currentStep > 0 && (
              <p
                className={classes.backButton}
                onClick={() => {
                  setCurrentStep((prev) => prev - 1);
                }}
              >
                Back
              </p>
            )}{' '}
            {dialogTitle}
          </div>
          <div className={classes.content}>{currentStepElement}</div>
        </div>
      </div>,
      document.getElementById('dialogs')
    );
  } else {
    return null;
  }
}

export async function action({ request }) {
  const formData = await request.formData();

  const response = await authFetch('http://localhost:4000/user/uploadImageToGallery', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (response.ok) {
    return { success: true, redirectUrl: request.url };
  }
}
