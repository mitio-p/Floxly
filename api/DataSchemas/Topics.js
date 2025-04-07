const mongoose = require('mongoose');

const topicsSchema = new mongoose.Schema({
  author: { type: mongoose.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now(), immutable: true },
  text: { type: String },
  comments: { type: Array, required: true },
});

module.exports = new mongoose.model('topics', topicsSchema);
