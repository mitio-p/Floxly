import { Link, useRouteError } from 'react-router-dom';
import classes from './ErrorElement.module.css';

export default function ErrorElement() {
  const errorData = useRouteError();
  return (
    <main className={classes.errorContainer}>
      <div className={classes.itemsContainer}>
        <img src="/Floxly logo.svg" />
        <div>
          <h2>Something went wrong!</h2>
          <h4>{errorData.data}</h4>
          <h4>{errorData.status}</h4>
          <Link to="/">
            <button>Go back!</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
