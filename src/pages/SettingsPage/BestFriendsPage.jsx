import authFetch from '../../Utils/authFetch';
import classes from './BestFriendsPage.module.css';
import BestFriendRow from '../../components/BestFriendsRow/BestFriendRow';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import UserCTX from '../../Context/UserCTX';
import { getLocale } from '../../Utils/localization';
import leftArrowIcon from '../../assets/icons/left-arrow.png';

export default function BestFriendsPage() {
  const loaderData = useLoaderData();
  const [searchResult, setSearchResult] = useState([]);
  const userData = useContext(UserCTX);
  const navigate = useNavigate();

  async function handleSearch(search) {
    if (search.length > 2) {
      const response = await fetch(
        `http://localhost:3000/floxly/users/search/${search}`
      );

      if (response.ok)
        setSearchResult(
          (await response.json()).filter((user) =>
            userData.user.following.includes(user._id)
          )
        );
    } else {
      setSearchResult('');
    }
  }

  return (
    <main className={classes.globalContainer}>
      <div className={classes.listContainer}>
        <h1>
          <img
            src={leftArrowIcon}
            className={classes.back}
            onClick={() => {
              navigate('/settings');
            }}
          />
          {getLocale('best_friends')}
        </h1>
        <div className={classes.list}>
          <div className={classes.inputContainer}>
            <input
              type='text'
              placeholder={getLocale('search')}
              onChange={(event) => {
                handleSearch(event.target.value);
              }}
            />
          </div>
          <div>
            {searchResult.length > 0
              ? searchResult.map((result) => (
                  <BestFriendRow
                    key={result._id}
                    data={result}
                    isBestFriends={loaderData.some(
                      (user) => user.id === result._id
                    )}
                  />
                ))
              : loaderData.map((friend) => (
                  <BestFriendRow
                    key={friend._id}
                    data={friend}
                    isBestFriends={true}
                  />
                ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export async function loader() {
  const response = await authFetch(
    'http://localhost:3000/floxly/users/best_friends',
    { credentials: 'include' }
  );

  return response;
}
