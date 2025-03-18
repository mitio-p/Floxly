import { useContext } from 'react';
import classes from './Home.module.css';
import UserCTX from '../../Context/UserCTX';
import { useLoaderData } from 'react-router-dom';
import Post from './Post';

export default function HomeView() {
  const loaderData = useLoaderData();
  return (
    <div className={classes.homeViewContainer}>
      {loaderData.map((post) => (
        <Post key={post._id} data={post} />
      ))}
    </div>
  );
}
