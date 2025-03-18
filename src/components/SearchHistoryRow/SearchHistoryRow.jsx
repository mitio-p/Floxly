import { Link } from 'react-router-dom';
import classes from './SearchHistoryRow.module.css';

import closeIcon from '../../assets/icons/close.svg';
import authFetch from '../../Utils/authFetch';

export default function SearchHistoryRow({ data, to, onRemoveRow }) {
  async function handleRemoveSearchedUser(id) {
    await authFetch('http://localhost:4000/users/removeSearch', { method: 'POST', body: id, credentials: 'include' });
    onRemoveRow(data._id);
  }

  return (
    <Link to={to} className={classes.result}>
      <img
        src={closeIcon}
        className={classes.remove}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleRemoveSearchedUser(data._id);
        }}
      />
      <img className={classes.profilePicture} src={data.profilePicture} alt="" />
      <div className={classes.resultUserContainer}>
        <h1>{data.username}</h1>
        <h2>{data.fullName}</h2>
      </div>
    </Link>
  );
}
