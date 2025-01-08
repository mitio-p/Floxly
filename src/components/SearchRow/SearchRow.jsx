import classes from './SearchRow.module.css';

export default function SearchRow({ data }) {
  return (
    <div className={classes.result}>
      <img src={data.profilePicture} alt="" />
      <div className={classes.resultUserContainer}>
        <h1>{data.username}</h1>
        <h2>{data.fullName}</h2>
      </div>
    </div>
  );
}
