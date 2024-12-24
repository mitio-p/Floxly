import { useState } from 'react';
import classes from './OptionsDialog.module.css';
import { createPortal } from 'react-dom';

export default function OptionsDialog({ options, isOpen, setOpen, onClose }) {
  function closeDialog(title) {
    setOpen((prev) => ({ options: prev.options, isOpen: false }));
  }

  if (isOpen) {
    return createPortal(
      <div className={classes.dialogContainer} onClick={closeDialog}>
        <ul>
          {options.map((option, index) => (
            <>
              <li
                onClick={
                  option?.type === 'cancel'
                    ? closeDialog
                    : () => {
                        option.clickFN(closeDialog);
                      }
                }
                key={option.title}
              >
                <p style={option?.isDangerous ? { color: '#ff4d4d', fontWeight: 600 } : undefined}>{option.title}</p>
              </li>
              {index < options.length - 1 && <div className={classes.divider}></div>}
            </>
          ))}
        </ul>
      </div>,
      document.getElementById('dialogs')
    );
  } else {
    return null;
  }
}
