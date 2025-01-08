import { forwardRef, useEffect, useRef, useState } from 'react';
import classes from './Input.module.css';

const Input = forwardRef(function Input(
  { label, maxCharacters, enableEmoji, enableCounter, isTextArea, isRequired, errorMessage, ...props },
  ref
) {
  const [isFocused, setFocused] = useState(false);
  const [counter, setCounter] = useState(0);
  const [inputValue, setInputValue] = useState('');

  function handleInputChange(event) {
    setCounter(event.target.value.length);
    setInputValue(event.target.value);
  }

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
      {isTextArea ? (
        <textarea
          type="text"
          {...props}
          ref={ref}
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
      ) : (
        <input
          type="text"
          {...props}
          ref={ref}
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
      )}
      {enableEmoji && <div className={classes.emojiContainer}></div>}

      {errorMessage && <p className={classes.error}>{errorMessage}</p>}

      {enableCounter && (
        <p className={classes.counter}>
          {counter}/{maxCharacters || 100}
        </p>
      )}
    </div>
  );
});

export default Input;
