import classes from './EmptyPagePost.module.css';
import circleCheck from '../../assets/icons/circle-check.svg';
import { getLocale } from '../../Utils/localization';

export default function EmptyPagePost() {
  return (
    <div className={classes.postContainer}>
      <h1>{getLocale('no_recomended_posts')}</h1>
      <img src={circleCheck} alt="" />
      <h2>{getLocale('follow_people_suggest')}</h2>
    </div>
  );
}
