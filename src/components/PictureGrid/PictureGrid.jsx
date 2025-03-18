import classes from './PictureGrid.module.css';
import PlusIcon from '../../assets/icons/plus.svg';

export default function PictureGrid({ pictures, enableAddPhoto, onAddPhoto, onSelectPhoto }) {
  return (
    <div className={classes.gridContainer} style={pictures.length > 2 ? { justifyContent: 'start' } : undefined}>
      {enableAddPhoto && (
        <div className={classes.createContainer} onClick={onAddPhoto}>
          <img src={PlusIcon} alt="" />
        </div>
      )}
      {typeof pictures !== 'number' &&
        pictures.map((pic) => (
          <img
            key={pic._id}
            src={pic.imgSrc}
            onClick={() => {
              onSelectPhoto(pic._id);
            }}
            style={pic.isBestFriendsOnly ? { border: 'solid 2px rgb(104, 165, 69)' } : undefined}
          />
        ))}
    </div>
  );
}
