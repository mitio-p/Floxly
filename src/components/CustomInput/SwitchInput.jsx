import { useEffect, useState } from 'react';
import classes from './SwitchInput.module.css';

export default function SwitchInput({ label, onInputChange }) {
  const [isClicked, setClicked] = useState(false);
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
