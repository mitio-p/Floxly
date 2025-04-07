import classes from './ConfirmDialog.module.css';

export default function ConfirmDialog({ text, isDangerous, onConfirm, onCancel }) {
  return (
    <div className={classes.dialogContainer}>
      <div className={classes.dialogBody}>
        <p>{text}</p>
        <div className={classes.buttonsContainer}>
          <button onClick={onConfirm} className={isDangerous ? classes.confirmDanger : classes.confirm}>
            Confirm
          </button>
          <button onClick={onCancel} className={classes.cancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
