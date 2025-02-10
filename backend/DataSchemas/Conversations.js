const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: Array,
  lastSentMessage: Object,
  messages: Array,
  dateCreated: { type: Date, default: Date.now(), immutable: true },
});

module.exports = mongoose.model('conversations', conversationSchema);
