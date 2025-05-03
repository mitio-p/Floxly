import { useEffect, useState } from 'react';
import HomeView from '../../components/HomeView/HomeView.jsx';
import Suggest from '../../components/SuggestSection/Suggest.jsx';
import authFetch from '../../Utils/authFetch.js';
import classes from './HomePage.module.css';

export default function HomePage() {
  return (
    <main className={classes.homeContainer}>
      <HomeView />
      <Suggest />
    </main>
  );
}

export async function loader() {
  const response = await authFetch('http://localhost:3000/floxly/user/fetch/recommended-posts', {
    credentials: 'include',
  });

  if (response.ok) {
    return response;
  }
}
