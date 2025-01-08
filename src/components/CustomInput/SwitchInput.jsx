import { useEffect, useState } from 'react';
import classes from './SwitchInput.module.css';

export default function SwitchInput({ label, onInputChange, defaultValue, value }) {
  const [isClicked, setClicked] = useState(defaultValue || false);

  useEffect(() => {
    setClicked(value);
  }, [value]);
  return (
    <div className={classes.inputContainer}>
      <label>{label}</label>
      <div
        className={isClicked ? classes.switchContainerActive : classes.switchContainerPassive}
        onClick={() => {
          onInputChange(!isClicked);
          setClicked((click) => !click);
        }}
      >
        <div className={classes.circle}></div>
      </div>
    </div>
  );
}
