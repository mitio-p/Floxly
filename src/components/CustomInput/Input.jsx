import { useEffect, useRef, useState } from 'react';
import classes from './Input.module.css';

export default function Input({ label, maxCharacters, enableEmoji, enableCounter, isRequired, ...props }) {
  const [isFocused, setFocused] = useState(false);
  const [counter, setCounter] = useState(0);
  const [inputValue, setInputValue] = useState('');

  function handleInputChange(event) {
    setCounter(event.target.value.length);
    setInputValue(event.target.value);
  }

  useEffect(() => {}, []);

  return (
    <div className={classes.inputContainer}>
      <label className={isFocused || inputValue ? classes.inputLabel : classes.placeHolder}>
        {isRequired ? (
          <>
            <span style={{ color: 'red', fontSize: 15 }}>*</span> {label}
          </>
        ) : (
          label
        )}
      </label>
      <input
        type="text"
        {...props}
        required={isRequired}
        maxLength={maxCharacters || 100}
        onChange={handleInputChange}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
      />
      {enableCounter && (
        <p className={classes.counter}>
          {counter}/{maxCharacters || 100}
        </p>
      )}
    </div>
  );
}
