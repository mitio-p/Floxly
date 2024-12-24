const mongoose = require('mongoose');

const topicsSchema = new mongoose.Schema({
  author: { type: String, required: true },
  hashtags: { type: Array, required: true },
  src: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), immutable: true },
  likes: Number,
  disLikes: Number,
  comments: { type: Array, required: true },
  shareLink: { type: String, required: true },
});

module.exports = new mongoose.model('topics', topicsSchema);
