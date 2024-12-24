const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
  author: { type: String, required: true },
  collaborators: Array,
  hashtags: { type: Array, required: true },
  src: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), immutable: true },
  likes: { type: Array, required: true },
  comments: { type: Array, required: true },
  shareLink: { type: String, required: true },
});

module.exports = mongoose.model('posts', postsSchema);
