import { useSearchParams } from 'react-router-dom';
import classes from './PhotoViewer.module.css';
import { useEffect, useState } from 'react';
import authFetch from '../../Utils/authFetch';

export default function PhotoViewer({ user }) {
  const [searchParams] = useSearchParams();
  const [photo, setPhoto] = useState();
  const [error, setError] = useState(false);
  console.log(photo);

  async function handleFetchPhoto() {
    const response = await authFetch(`http://localhost:4000/photo/${searchParams.get('p')}`, {
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

  return <div className={classes.viewerContainer}></div>;
}
