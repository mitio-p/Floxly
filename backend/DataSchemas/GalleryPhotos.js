const mongoose = require('mongoose');

const galleryPhotosSchema = new mongoose.Schema({
  author: { type: mongoose.Types.ObjectId, required: true },
  imgSrc: { type: String, required: true },
  likersId: { type: Array, default: [] },
  comments: { type: Array, default: [] },
  text: String,
  location: String,
  tagged: String,
  isBestFriendsOnly: { type: Boolean, required: true },
  isLikesCountHidden: { type: Boolean, required: true },
  isCommentsOff: { type: Boolean, required: true },
  uploadedAt: { type: Number, default: Date.now(), immutable: true },
});

module.exports = mongoose.model('galleyPhotos', galleryPhotosSchema);
