import authFetch from '../../Utils/authFetch';
import classes from './BestFriendsPage.module.css';
import BestFriendRow from '../../components/BestFriendsRow/BestFriendRow';
import { useLoaderData } from 'react-router-dom';
import { useContext, useState } from 'react';
import UserCTX from '../../Context/UserCTX';

export default function BestFriendsPage() {
  const loaderData = useLoaderData();
  const [searchResult, setSearchResult] = useState([]);
  const userData = useContext(UserCTX);

  async function handleSearch(search) {
    if (search.length > 2) {
      const response = await fetch(`http://localhost:4000/users/search/${search}`);

      if (response.ok)
        setSearchResult((await response.json()).filter((user) => userData.user.following.includes(user._id)));
    } else {
      setSearchResult('');
    }
  }

  return (
    <main className={classes.globalContainer}>
      <div className={classes.listContainer}>
        <h1>Best friends</h1>
        <div className={classes.list}>
          <div className={classes.inputContainer}>
            <input
              type="text"
              placeholder="Search"
              onChange={(event) => {
                handleSearch(event.target.value);
              }}
            />
          </div>
          <div>
            {searchResult.length > 0
              ? searchResult.map((result) => (
                  <BestFriendRow data={result} isBestFriends={userData.user.bestFriends.includes(result._id)} />
                ))
              : loaderData.map((friend) => (
                  <BestFriendRow data={friend} isBestFriends={userData.user.bestFriends.includes(friend._id)} />
                ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export async function loader() {
  const response = await authFetch('http://localhost:4000/users/best_friends', { credentials: 'include' });

  return response;
}
