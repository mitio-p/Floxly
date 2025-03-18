import HomeView from '../../components/HomeView/HomeView.jsx';
import authFetch from '../../Utils/authFetch.js';
import classes from './HomePage.module.css';

export default function HomePage() {
  return (
    <main className={classes.homeContainer}>
      <HomeView />
      <h1 style={{ color: 'white', flex: '1' }}>Suggest</h1>
    </main>
  );
}

export async function loader() {
  const response = await authFetch('http://localhost:4000/user/fetch/recommended-posts', { credentials: 'include' });

  if (response.ok) {
    return response;
  }
}
