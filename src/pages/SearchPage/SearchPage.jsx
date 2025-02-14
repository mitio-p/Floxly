import { useEffect, useState } from 'react';
import Input from '../../components/CustomInput/Input';
import classes from './SearchPage.module.css';
import SearchRow from '../../components/SearchRow/SearchRow';
import { getLocale } from '../../Utils/localization';

export default function SearchPage() {
  const [searchResult, setSearchResult] = useState([]);

  async function handleSearch(search) {
    if (search.length > 2) {
      const response = await fetch(`http://localhost:4000/users/search/${search}`);
      if (response.ok) {
        setSearchResult(await response.json());
      }
    } else {
      setSearchResult([]);
    }
  }

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
          {searchResult.map((result) => (
            <SearchRow key={result.username} data={result} to={`/user/${result.username}`} />
          ))}
        </div>
      </div>
    </main>
  );
}
