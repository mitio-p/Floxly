const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const storage = multer.memoryStorage();
const UserSchema = require('./DataSchemas/Users');
const PostsSchema = require('./DataSchemas/Posts');
const TopicsSchema = require('./DataSchemas/Topics');
const GalleryPhotosSchema = require('./DataSchemas/GalleryPhotos.js');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const gatherUserInfo = require('./Middleware/gatherUserInfo.js');
require('dotenv').config();
const upload = multer({ storage });

const s3 = new AWS.S3();

const awsRegion = 'eu-north-1';

mongoose.connect(process.env.DATABASE_CONNECTION_STRING);

app.use(express.json());

app.use(cookieParser());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.get('/user/:username', gatherUserInfo, async (req, res) => {
  const fetchedUser = await UserSchema.findOne({ username: req.params.username });
  const userGallery = await GalleryPhotosSchema.find({ author: fetchedUser._id });

  userGallery.sort((photoA, photoB) => photoB.uploadedAt - photoA.uploadedAt);

  if (fetchedUser) {
    const publicUserInfo = {
      uid: fetchedUser._id.toString(),
      username: fetchedUser.username,
      fullName: fetchedUser.fullName,
      followers: fetchedUser.followers,
      following: fetchedUser.following,
      profilePicture: fetchedUser.profilePicture,
      bio: fetchedUser.bio || null,
      gallery: userGallery.length,
    };

    if (fetchedUser._id === req.user._id) {
      publicUserInfo.gallery = userGallery;
      publicUserInfo.posts = await PostsSchema.find({ author: fetchedUser.username });
      publicUserInfo.topics = await TopicsSchema.find({ author: fetchedUser.username });
    } else {
      if (!fetchedUser.privateAccount || fetchedUser.followers.includes(req.user.username)) {
        publicUserInfo.gallery = userGallery;
        publicUserInfo.posts = await PostsSchema.find({ author: fetchedUser.username });
        publicUserInfo.topics = await TopicsSchema.find({ author: fetchedUser.username });
      }
    }

    const isFollowing = fetchedUser.followers.includes(req.user._id.toString());

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

app.post('/user/uploadImageToGallery', upload.single('photoFile'), gatherUserInfo, async (req, res) => {
  const user = await UserSchema.findById(req.user._id);
  const formData = req.body;

  const bucketName = 'user-gallery-photos';
  const objectKey = crypto.randomBytes(10).toString('hex') + req.file.originalname;

  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Body: req.file.buffer,
  };

  s3.putObject(params)
    .promise()
    .then(async () => {
      GalleryPhotosSchema.create({
        author: user._id,
        imgSrc: `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${objectKey}`,
        text: formData.text,
        location: formData.location,
        tagged: formData.tagged,
        isBestFriendsOnly: formData.bestFriendsOnly === 'true',
        isLikesCountHidden: formData.isLikesCountHidden === 'true',
        isCommentsOff: formData.isCommentsOff === 'true',
      })
        .then(() => {
          res.sendStatus(200);
        })
        .catch(() => {
          res.sendStatus(500);
        });
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

app.listen(4000);
