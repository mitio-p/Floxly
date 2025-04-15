import { useContext } from 'react';
import classes from './Home.module.css';
import UserCTX from '../../Context/UserCTX';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import Post from './Post';
import Topics from './Topics';
import EmptyPagePost from './EmptyPagePost';
import { getLocale } from '../../Utils/localization';

export default function HomeView() {
  const loaderData = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  function togglePosts() {
    setSearchParams((prev) => {
      prev.set('variant', 'posts');
      return prev;
    });
  }

  function toggleTopics() {
    setSearchParams((prev) => {
      prev.set('variant', 'topics');
      return prev;
    });
  }

  return (
    <div className={classes.homeViewContainer}>
      <div className={classes.variantSwitcher}>
        <div onClick={togglePosts}>
          <p>{getLocale('posts')}</p>
          {searchParams.get('variant') !== 'topics' && <div className={classes.indicator}></div>}
        </div>
        <div onClick={toggleTopics}>
          <p>{getLocale('topics')}</p>
          {searchParams.get('variant') === 'topics' && <div className={classes.indicator}></div>}
        </div>
      </div>
      {searchParams.get('variant') !== 'topics' && loaderData.map((post) => <Post key={post._id} data={post} />)}
      {searchParams.get('variant') !== 'topics' && loaderData.length < 1 && <EmptyPagePost />}
      {searchParams.get('variant') === 'topics' && <Topics />}
    </div>
  );
}
