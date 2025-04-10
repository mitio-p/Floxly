import { useContext, useEffect, useState } from 'react';
import Input from '../../components/CustomInput/Input';
import classes from './SearchPage.module.css';
import SearchRow from '../../components/SearchRow/SearchRow';
import { getLocale } from '../../Utils/localization';
import authFetch from '../../Utils/authFetch';
import SearchHistoryRow from '../../components/SearchHistoryRow/SearchHistoryRow';
import UserCTX from '../../Context/UserCTX';

export default function SearchPage() {
  const userData = useContext(UserCTX);
  const [searchResult, setSearchResult] = useState([]);

  const [searchHistory, setSearchHistory] = useState([]);

  async function handleSearch(search) {
    if (search.length > 2) {
      const response = await fetch(`http://localhost:3000/floxly/users/search/${search}`);
      if (response.ok) {
        setSearchResult(await response.json());
      }
    } else {
      setSearchResult([]);
    }
  }

  function handleRemovePersonRow(id) {
    setSearchHistory((prevHistory) => prevHistory.filter((row) => row._id !== id));
  }

  async function handleSelectUser(id) {
    const response = await authFetch('http://localhost:3000/floxly/users/addSearch', {
      method: 'POST',
      body: id,
      credentials: 'include',
    });
  }

  useEffect(() => {
    if (userData.user.searchHistory) {
      setSearchHistory(userData.user.searchHistory);
    }
  }, [userData.user]);

  return (
    <main className={classes.globalContainer}>
      <h1>{getLocale('search')}</h1>
      <div className={classes.innerContainer}>
        <input
          type="text"
          placeholder={getLocale('search')}
          onChange={(event) => {
            handleSearch(event.target.value);
          }}
        />
        <div className={classes.resultsContainer}>
          {searchResult.length < 1 &&
            searchHistory.map((search) => (
              <SearchHistoryRow
                key={search.username + search.fullName}
                data={search}
                to={`/user/${search.username}`}
                onRemoveRow={handleRemovePersonRow}
              />
            ))}
          {searchResult.map((result) => (
            <SearchRow key={result.username} data={result} to={`/user/${result.username}`} clickFN={handleSelectUser} />
          ))}
        </div>
      </div>
    </main>
  );
}
