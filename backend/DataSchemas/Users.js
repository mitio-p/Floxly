const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  username: { type: String, required: true, max: 20 },
  fullName: { type: String, required: true, max: 40 },
  bio: { type: String, max: 150 },
  password: { type: String, required: true },
  email: { type: String, required: true },
  bestFriends: { type: Array, default: [] },
  phoneNumber: String,
  phoneNumberVerified: Boolean,
  twoFactorSecure: Boolean,
  verifyCode: Number,
  followers: Array,
  following: Array,
  gallery: Array,
  preferredHashtags: Array,
  profilePicture: String,
  createdAt: { type: Date, default: Date.now(), immutable: true },
  forgotPasswordToken: String,
  refreshTokens: Array,
  privateAccount: Boolean,
});

module.exports = mongoose.model('users', usersSchema);
