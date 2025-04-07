const mongoose = require('mongoose');

const RevokedTokensSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId },
  token: String,
  revokedAt: Date,
});

module.exports = mongoose.model('revokedTokens', RevokedTokensSchema);
