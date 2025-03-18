import classes from './Post.module.css';

export default function Post({ data }) {
  return (
    <div>
      <div className={classes.userInfo}>
        <img src={data.author.profilePicture} alt="" />
        <p>{data.author.username}</p>
      </div>
      <img src={data.imgSrc} alt="" />
    </div>
  );
}
