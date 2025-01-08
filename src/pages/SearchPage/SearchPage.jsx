import { useEffect, useState } from 'react';
import Input from '../../components/CustomInput/Input';
import classes from './SearchPage.module.css';
import SearchRow from '../../components/SearchRow/SearchRow';

export default function SearchPage() {
  const [searchResult, setSearchResult] = useState([]);

  async function handleSearch(search) {
    if (search.length > 2) {
      const response = await fetch(`http://localhost:4000/users/search/${search}`);
      if (response.ok) {
        setSearchResult(await response.json());
      }
    }
  }

  return (
    <main className={classes.globalContainer}>
      <h1>Search</h1>
      <div className={classes.innerContainer}>
        <input
          type="text"
          placeholder="Search"
          onChange={(event) => {
            handleSearch(event.target.value);
          }}
        />
        <div className={classes.resultsContainer}>
          {searchResult.map((result) => (
            <SearchRow data={result} />
          ))}
        </div>
      </div>
    </main>
  );
}
