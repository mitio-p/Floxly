import classes from './EmptyPagePost.module.css';
import circleCheck from '../../assets/icons/circle-check.svg';

export default function EmptyPagePost() {
  return (
    <div className={classes.postContainer}>
      <h1>You have no recommended posts!</h1>
      <img src={circleCheck} alt="" />
      <h2>Follow people to see their posts here!</h2>
    </div>
  );
}
