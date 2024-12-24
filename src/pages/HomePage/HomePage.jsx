import HomeView from '../../components/HomeView/HomeView.jsx';
import classes from './HomePage.module.css';

export default function HomePage() {
  return (
    <main className={classes.homeContainer}>
      <HomeView />
      <h1 style={{ color: 'white', flex: '1' }}>Suggest</h1>
    </main>
  );
}
