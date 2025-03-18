import { Link } from 'react-router-dom';
import classes from './SearchRow.module.css';

export default function SearchRow({ data, to, clickFN }) {
  return (
    <Link
      to={to}
      className={classes.result}
      onClick={() => {
        clickFN(data._id);
      }}
    >
      <img src={data.profilePicture} alt="" />
      <div className={classes.resultUserContainer}>
        <h1>{data.username}</h1>
        <h2>{data.fullName}</h2>
      </div>
    </Link>
  );
}
