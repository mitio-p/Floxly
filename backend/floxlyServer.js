const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const UserSchema = require('./DataSchemas/Users');
const PostsSchema = require('./DataSchemas/Posts');
const TopicsSchema = require('./DataSchemas/Topics');
const gatherUserInfo = require('./Middleware/gatherUserInfo.js');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_CONNECTION_STRING);

app.use(express.json());

app.use(cookieParser());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.get('/user/:username', gatherUserInfo, async (req, res) => {
  const user = await UserSchema.findById(req.user._id.toString());
  const fetchedUser = await UserSchema.findOne({ username: req.params.username });

  if (fetchedUser) {
    const publicUserInfo = {
      uid: fetchedUser._id.toString(),
      username: fetchedUser.username,
      fullName: fetchedUser.fullName,
      followers: fetchedUser.followers,
      following: fetchedUser.following,
      profilePicture: fetchedUser.profilePicture,
      bio: fetchedUser.bio || null,
      gallery: fetchedUser.gallery.length,
    };

    if (!fetchedUser.privateAccount || fetchedUser.followers.includes(decodedToken.username)) {
      publicUserInfo.gallery = fetchedUser.gallery;
      publicUserInfo.posts = await PostsSchema.find({ author: fetchedUser.username });
      publicUserInfo.topics = await TopicsSchema.find({ author: fetchedUser.username });
    }

    const isFollowing = fetchedUser.followers.includes(user._id.toString());

    res.status(200).json({ user: publicUserInfo, isFollowing: isFollowing });
  } else {
    res.sendStatus(404);
  }
});

app.get('/user/follow/:username', gatherUserInfo, async (req, res) => {
  const targetUser = await UserSchema.findOne({ username: req.params.username }); //fetching user that will be followed
  const fetchedUser = await UserSchema.findOne({ username: req.user.username }); //fetching user that will follow
  if (
    targetUser &&
    fetchedUser &&
    targetUser !== fetchedUser &&
    !targetUser.followers.includes(fetchedUser._id.toString())
  ) {
    if (!targetUser.privateAccount) {
      targetUser.followers.push(fetchedUser._id.toString());
      fetchedUser.following.push(targetUser._id.toString());
      targetUser.save();
      fetchedUser.save();
      res.sendStatus(200);
    }
  }
});

app.get('/user/unfollow/:username', gatherUserInfo, async (req, res) => {
  const targetUser = await UserSchema.findOne({ username: req.params.username }); //fetching user that will be unfollowed
  const fetchedUser = await UserSchema.findOne({ username: req.user.username }); //fetching user that will unfollow
  if (
    targetUser &&
    fetchedUser &&
    targetUser !== fetchedUser &&
    targetUser.followers.includes(fetchedUser._id.toString())
  ) {
    targetUser.followers.splice(targetUser.followers.indexOf(fetchedUser._id.toString()), 1);
    fetchedUser.following.splice(fetchedUser.following.indexOf(targetUser._id.toString(), 1));
    targetUser.save();
    fetchedUser.save();
    res.sendStatus(200);
  }
});

app.listen(4000);
