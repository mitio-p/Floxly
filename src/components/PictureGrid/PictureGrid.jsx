import classes from './PictureGrid.module.css';
import PlusIcon from '../../assets/icons/plus.svg';

export default function PictureGrid({ pictures, enableAddPhoto, onAddPhoto }) {
  return (
    <div className={classes.gridContainer} style={pictures.length > 2 ? { justifyContent: 'start' } : undefined}>
      {enableAddPhoto && (
        <div className={classes.createContainer} onClick={onAddPhoto}>
          <img src={PlusIcon} alt="" />
        </div>
      )}
      {typeof pictures !== 'number' && pictures.map((pic) => <img key={pic._id} src={pic.imgSrc} />)}
    </div>
  );
}
