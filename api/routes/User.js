const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const storage = multer.memoryStorage();
const UserSchema = require('../DataSchemas/Users.js');
const PostsSchema = require('../DataSchemas/Posts.js');
const TopicsSchema = require('../DataSchemas/Topics.js');
const GalleryPhotosSchema = require('../DataSchemas/GalleryPhotos.js');
const ConversationsSchema = require('../DataSchemas/Conversations.js');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const gatherUserInfo = require('../Middleware/gatherUserInfo.js');
const GalleryPhotos = require('../DataSchemas/GalleryPhotos.js');
require('dotenv').config();
const upload = multer({ storage });

const s3 = new AWS.S3();

const awsRegion = 'eu-north-1';

router.get('/user/:username', gatherUserInfo, async (req, res) => {
  //fetching certain user info
  const fetchedUser = await UserSchema.findOne({
    username: req.params.username,
  });
  if (!fetchedUser) return res.sendStatus(404);

  let userGallery = await GalleryPhotosSchema.find({
    author: fetchedUser._id,
  });

  if (
    !fetchedUser.bestFriends.includes(req.user._id.toString()) &&
    req.user._id.toString() !== fetchedUser._id.toString()
  ) {
    userGallery = userGallery.filter((photo) => !photo.isBestFriendsOnly);
  }

  userGallery.sort((photoA, photoB) => photoB.uploadedAt - photoA.uploadedAt);

  if (req.user.role !== 'admin') {
    userGallery = userGallery.filter((photo) => !photo.isDeactivated);
  }

  if (fetchedUser) {
    const publicUserInfo = {
      uid: fetchedUser._id.toString(),
      username: fetchedUser.username,
      fullName: fetchedUser.fullName,
      followers: fetchedUser.followers,
      following: fetchedUser.following,
      profilePicture: fetchedUser.profilePicture,
      bio: fetchedUser.bio || null,
      photosCount: userGallery.length,
      privateAccount: fetchedUser.privateAccount,
      isDeactivated: fetchedUser.isDeactivated,
    };

    if (fetchedUser._id.toString() === req.user._id.toString()) {
      publicUserInfo.gallery = userGallery;
      publicUserInfo.posts = await PostsSchema.find({
        author: fetchedUser.username,
      });
      publicUserInfo.topics = await TopicsSchema.find({
        author: fetchedUser._id,
      });
    } else {
      if (!fetchedUser.privateAccount || fetchedUser.followers.includes(req.user._id.toString())) {
        publicUserInfo.gallery = userGallery;
        publicUserInfo.posts = await PostsSchema.find({
          author: fetchedUser.username,
        });
        publicUserInfo.topics = await TopicsSchema.find({
          author: fetchedUser._id,
        });
      }
    }

    const isFollowing = fetchedUser.followers.includes(req.user._id.toString());

    res.status(200).json({
      user: publicUserInfo,
      isFollowing: isFollowing,
      isRequested: fetchedUser.followRequestUsers.includes(req.user._id.toString()),
    });
  } else {
    res.sendStatus(404);
  }
});

router.get('/user/follow/:username', gatherUserInfo, async (req, res) => {
  const targetUser = await UserSchema.findOne({
    username: req.params.username,
  }); //fetching user that will be followed
  const fetchedUser = await UserSchema.findOne({ username: req.user.username }); //fetching user that will follow

  if (
    targetUser &&
    fetchedUser &&
    targetUser !== fetchedUser &&
    !targetUser.followers.includes(fetchedUser._id.toString())
  ) {
    if (!targetUser.privateAccount) {
      targetUser.followers.push(fetchedUser._id.toString());
      targetUser.notifications.push({
        type: 'followMessage',
        from: fetchedUser._id.toString(),
        date: Date.now(),
        isRead: false,
      });
      fetchedUser.following.push(targetUser._id.toString());
      targetUser.save();
      fetchedUser.save();
      res.sendStatus(200);
    } else {
      targetUser.followRequestUsers.push(fetchedUser._id.toString());
      targetUser.notifications.push({
        type: 'followRequest',
        from: fetchedUser._id.toString(),
        date: Date.now(),
        isRead: false,
      });
      targetUser.save();
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(400);
  }
});

router.get('/user/unfollow/:username', gatherUserInfo, async (req, res) => {
  const targetUser = await UserSchema.findOne({
    username: req.params.username,
  }); //fetching user that will be unfollowed
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

router.post('/user/uploadImageToGallery', upload.single('photoFile'), gatherUserInfo, async (req, res) => {
  const user = await UserSchema.findById(req.user._id);
  const formData = req.body;

  const bucketName = 'user-gallery-photos';
  const objectKey = crypto.randomBytes(10).toString('hex') + req.file.originalname;

  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Body: req.file.buffer,
  };

  //Uploading the photo to the AWS servers
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

router.post('/user/updateUserInfo', upload.single('photo'), gatherUserInfo, async (req, res) => {
  const formData = req.body;

  const bucketName = 'user-profile-pictures-floxly1';

  if (formData.username || formData.fullName || formData.bio || req.file) {
    const fetchedUser = await UserSchema.findById(req.user._id);

    if (req.file) {
      const objectKey = crypto.randomBytes(10).toString('hex') + req.file.originalname;
      const params = {
        Bucket: bucketName,
        Key: objectKey,
        Body: req.file.buffer,
      };
      await s3.putObject(params).promise();
      fetchedUser.profilePicture = `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${objectKey}`;
    }

    if (formData?.username) {
      const duplcatedUser = await UserSchema.findOne({
        username: formData.username,
      });
      if (duplcatedUser) {
        return res.status(400).send({
          errors: { username: 'This username is already taken' },
        });
      }
    }
    //Saving only the changed fields
    Object.keys(formData).forEach(async (key) => {
      formData[key] ? (fetchedUser[key] = formData[key]) : null;
    });
    fetchedUser.save();
    res.json({
      success: { message: 'User profile updated successfully!' },
    });
  } else {
    res.status(400).send({
      error: { message: 'Enter at least one field to update the profile!' },
    });
  }
});

router.get('/users/best_friends', gatherUserInfo, async (req, res) => {
  const userBestFriendIds = req.user.bestFriends;
  let bestFriendsList = [];

  //Converting user Ids to user infos
  for (const bestFriendId of userBestFriendIds) {
    bestFriendsList.push(await UserSchema.findById(bestFriendId).select('profilePicture username fullName'));
  }

  res.json(bestFriendsList);
});

router.get('/user/cancelRequest/:username', gatherUserInfo, async (req, res) => {
  const fetchedUser = await UserSchema.findOne({
    username: req.params.username,
  });
  if (fetchedUser.followRequestUsers.includes(req.user._id)) {
    const userIndex = fetchedUser.followRequestUsers.indexOf(req.user._id);
    fetchedUser.followRequestUsers.splice(userIndex, 1);
    fetchedUser.notifications = fetchedUser.notifications.filter(
      (notification) => notification.from !== req.user._id.toString()
    );
    fetchedUser.save();
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.get('/users/search/:query', async (req, res) => {
  const query = req.params.query;
  const searchResult = await UserSchema.find({
    username: { $regex: query, $options: 'i' },
  }).select('username profilePicture fullName');
  res.json(searchResult);
});

router.post('/users/addSearch', gatherUserInfo, async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  try {
    const searchedUser = await UserSchema.findById(req.body).select('profilePicture username fullName');

    if (!searchedUser) return res.sendStatus(404);

    const user = await UserSchema.findById(req.user._id);

    if (!user.searchHistory.includes(req.body)) {
      user.searchHistory.push(req.body);
    } else {
      const searchIndex = user.searchHistory.indexOf(req.body);
      user.searchHistory.splice(searchIndex, 1);
      user.searchHistory.push(req.body);
    }

    user.save();

    res.json(searchedUser);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.post('/users/removeSearch', gatherUserInfo, async (req, res) => {
  if (!req.body) return res.sendStatus(400);

  try {
    const searchedUser = await UserSchema.findById(req.body);

    if (!searchedUser) return res.sendStatus(404);

    const user = await UserSchema.findById(req.user._id.toString());

    const searchIndex = user.searchHistory.indexOf(req.body);

    user.searchHistory.splice(searchIndex, 1);

    user.save();

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

router.post('/user/acceptFollowRequest', gatherUserInfo, async (req, res) => {
  const targetUser = await UserSchema.findById(req.body.id); // User that made the follow request
  const fetchedUser = await UserSchema.findById(req.user._id.toString()); // User that will accept

  if (targetUser) {
    if (!fetchedUser.followRequestUsers.includes(targetUser._id.toString())) return res.sendStatus(404);
    targetUser.following.push(req.user._id.toString());
    fetchedUser.followers.push(req.body.id);
    const index = fetchedUser.followRequestUsers.indexOf(req.user._id);
    fetchedUser.followRequestUsers.splice(index, 1);
    fetchedUser.notifications = fetchedUser.notifications.filter(
      (notification) => notification.from !== targetUser._id.toString()
    );
    targetUser.save();
    fetchedUser.save();

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

router.post('/user/rejectFollowRequest', gatherUserInfo, async (req, res) => {
  const targetUser = await UserSchema.findById(req.body.id); // User that made the follow request
  const fetchedUser = await UserSchema.findById(req.user._id.toString()); // User that reject

  if (targetUser) {
    if (!fetchedUser.followRequestUsers.includes(targetUser._id.toString())) return res.sendStatus(404);
    const index = fetchedUser.followRequestUsers.indexOf(req.user._id);
    fetchedUser.followRequestUsers.splice(index, 1);
    fetchedUser.notifications = fetchedUser.notifications.filter(
      (notification) => notification.from !== targetUser._id.toString()
    );
    targetUser.save();
    fetchedUser.save();
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

router.get('/notifications', gatherUserInfo, async (req, res) => {
  let updatedNotifications = [];

  for (const notification of req.user.notifications) {
    if (notification.type === 'followRequest') {
      const sender = await UserSchema.findById(notification.from);
      notification.from = {
        profilePicture: sender.profilePicture,
        username: sender.username,
        id: sender._id.toString(),
      };
      updatedNotifications.push(notification);
    } else {
      updatedNotifications.push(notification);
    }
  }

  res.json(updatedNotifications.reverse());
});

router.post('/user/addBestFriend', gatherUserInfo, async (req, res) => {
  if (!req.user.following.includes(req.body)) return res.sendStatus(400);

  if (req.user.bestFriends.includes(req.body)) return res.status(401);

  const user = await UserSchema.findById(req.user._id);

  user.bestFriends.push(req.body);
  await user.save();
  res.sendStatus(200);
});
router.post('/user/removeBestFriend', gatherUserInfo, async (req, res) => {
  if (!req.user.following.includes(req.body)) return res.sendStatus(400);

  if (!req.user.bestFriends.includes(req.body)) return res.status(404);

  const user = await UserSchema.findById(req.user._id);

  user.bestFriends = user.bestFriends.filter((friend) => friend !== req.body);
  console.log(user.bestFriends);
  await user.save();
  res.sendStatus(200);
});

router.get('/photo/:photoId', gatherUserInfo, async (req, res) => {
  try {
    const photo = await GalleryPhotosSchema.findById(req.params.photoId);
    const author = await UserSchema.findById(photo.author);

    if (
      author.privateAccount &&
      !author.followers.includes(req.user._id) &&
      req.user._id.toString() !== author._id.toString()
    )
      return res.sendStatus(403);

    if (
      photo.isBestFriendsOnly &&
      !author.bestFriends.includes(req.user._id) &&
      author._id.toString() !== req.user._id.toString()
    )
      return res.sendStatus(403);

    const updatedComments = [];

    //Converting author id to author data
    for (let comment of photo.comments) {
      const author = await UserSchema.findById(comment.author).select('profilePicture username');
      comment.author = author;
      updatedComments.push(comment);
    }

    if (photo.isLikesCountHidden && photo.author !== req.user._id.toString()) photo.likersId = null;

    //sorting comments by likes
    updatedComments.sort((a, b) => b.likers.length - a.likers.length);

    photo.comments = updatedComments;

    res.json(photo);
  } catch {
    res.sendStatus(400);
  }
});

router.post('/photo/like/:photoId', gatherUserInfo, async (req, res) => {
  const photo = await GalleryPhotosSchema.findById(req.params.photoId);
  const author = await UserSchema.findById(photo.author);

  if (
    author.privateAccount &&
    !author.followers.includes(req.user._id) &&
    author._id.toString() !== req.user._id.toString()
  )
    return res.sendStatus(403);

  if (photo.isDeactivated) return res.sendStatus(403);

  photo.likersId.push(req.user._id.toString());
  photo.save();
  res.sendStatus(200);
});

router.post('/photo/dislike/:photoId', gatherUserInfo, async (req, res) => {
  const photo = await GalleryPhotosSchema.findById(req.params.photoId);
  const author = await UserSchema.findById(photo.author);

  if (
    author.privateAccount &&
    !author.followers.includes(req.user._id) &&
    author._id.toString() !== req.user._id.toString()
  )
    return res.sendStatus(403);

  if (photo.isDeactivated) return res.sendStatus(403);

  const userIndex = photo.likersId.indexOf(req.user._id.toString());
  photo.likersId.splice(userIndex, 1);
  photo.save();
  res.sendStatus(200);
});

router.post('/photo/:photoId/comment', gatherUserInfo, async (req, res) => {
  if (!req.body.text) return res.sendStatus(400);

  const photo = await GalleryPhotosSchema.findById(req.params.photoId);
  const author = await UserSchema.findById(photo.author);

  if (
    author.privateAccount &&
    !author.followers.includes(req.user._id) &&
    req.user._id.toString() !== author._id.toString()
  )
    return res.sendStatus(403);

  if (photo.isBestFriendsOnly && !author.bestFriends.includes(req.user._id)) return res.sendStatus(403);

  if (!photo) return res.sendStatus(404);

  let commentId = 1;

  if (photo.comments.length > 0) {
    const commentIDs = photo.comments.map((comment) => comment.id);
    commentId = Math.max(...commentIDs) + 1;
  }

  const comment = {
    id: commentId,
    dateSent: Date.now(),
    likers: [],
    replies: [],
    text: req.body.text,
    isEdited: false,
    author: req.user._id.toString(),
  };

  photo.comments.push(comment);

  await photo.save();

  res.json({
    ...comment,
    author: {
      profilePicture: req.user.profilePicture,
      username: req.user.username,
    },
  });
});

router.post('/photo/:photoId/comment/like', gatherUserInfo, async (req, res) => {
  if (!req.body.id || typeof req.body.id !== 'number') return res.sendStatus(400);

  const photo = await GalleryPhotosSchema.findById(req.params.photoId);
  if (!photo) return res.sendStatus(404);

  const author = await UserSchema.findById(photo.author);
  if (
    author.privateAccount &&
    !author.followers.includes(req.user._id) &&
    req.user._id.toString() !== author._id.toString()
  )
    return res.sendStatus(403);

  if (photo.isBestFriendsOnly && !author.bestFriends.includes(req.user._id)) return res.sendStatus(403);

  let commentIndex = photo.comments.findIndex((comment) => comment.id === req.body.id);
  if (commentIndex === -1) return res.sendStatus(404);

  if (photo.comments[commentIndex].likers.includes(req.user._id.toString())) {
    return res.sendStatus(400);
  }

  photo.comments[commentIndex].likers.push(req.user._id.toString());

  console.log(photo.comments[commentIndex]);

  photo.markModified('comments');

  await photo.save();

  res.sendStatus(200);
});

router.delete('/photo/:photoId/delete', gatherUserInfo, async (req, res) => {
  const photo = await GalleryPhotosSchema.findById(req.params.photoId);

  if (!photo) return res.sendStatus(404);
  if (photo.author.toString() !== req.user._id.toString()) return res.sendStatus(400);

  await photo.deleteOne();

  res.sendStatus(200);
});

router.post('/photo/:photoId/comment/cancelLike', gatherUserInfo, async (req, res) => {
  if (!req.body.id || typeof req.body.id !== 'number') return res.sendStatus(400);

  const photo = await GalleryPhotosSchema.findById(req.params.photoId);
  if (!photo) return res.sendStatus(404);

  const author = await UserSchema.findById(photo.author);
  if (
    author.privateAccount &&
    !author.followers.includes(req.user._id) &&
    req.user._id.toString() !== author._id.toString()
  )
    return res.sendStatus(403);

  if (photo.isBestFriendsOnly && !author.bestFriends.includes(req.user._id)) return res.sendStatus(403);

  let commentIndex = photo.comments.findIndex((comment) => comment.id === Number(req.body.id));
  if (commentIndex === -1) return res.sendStatus(404);

  const likers = photo.comments[commentIndex].likers;
  const userIndex = likers.indexOf(req.user._id.toString());

  if (userIndex === -1) return res.sendStatus(400);

  likers.splice(userIndex, 1);

  photo.markModified('comments');

  await photo.save();

  res.sendStatus(200);
});

router.get('/user/fetch/recommended-posts', gatherUserInfo, async (req, res) => {
  const userFollowingAccountsIds = req.user.following;
  let posts = [];

  for (let accountId of userFollowingAccountsIds) {
    const accountPosts = await GalleryPhotosSchema.find({
      author: accountId,
      isBestFriendsOnly: false,
      isDeactivated: false,
    });

    let updatedPosts = [];

    for (let post of accountPosts) {
      const postObj = post.toObject();
      const authorDetails = await UserSchema.findById(post.author).select('username fullName profilePicture');

      postObj.author = authorDetails;
      updatedPosts.push(postObj);
    }

    posts.push(...updatedPosts);
  }

  posts.sort((postA, postB) => postB.uploadedAt - postA.uploadedAt);
  res.json(posts);
});

router.post('/user/upload-topic', gatherUserInfo, (req, res) => {
  const text = req.body.text;

  if (!text) return res.sendStatus(400);

  if (text.length < 1 || text.length > 500) return res.sendStatus(400);

  TopicsSchema.create({
    text,
    author: req.user._id,
  });
  res.sendStatus(200);
});

router.get('/user/fetch/topics', gatherUserInfo, async (req, res) => {
  const topics = await TopicsSchema.find({});
  let updatedTopics = [];

  for (let topic of topics) {
    const updatedTopic = topic.toObject();
    console.log(updatedTopic);
    const author = await UserSchema.findById(updatedTopic.author).select('username profilePicture');
    updatedTopic.author = {
      username: author.username,
      profilePicture: author.profilePicture,
    };
    updatedTopics.push(updatedTopic);
  }

  res.json(updatedTopics);
});

router.post('/user/deactivate', gatherUserInfo, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(401);

  console.log(req.body.id);

  if (!req.body.id) return res.sendStatus(400);

  const userForDeactivation = await UserSchema.findById(req.body.id);

  if (!userForDeactivation) return res.sendStatus(404);

  userForDeactivation.isDeactivated = true;

  userForDeactivation.save();

  res.sendStatus(200);
});

router.post('/user/activate', gatherUserInfo, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(401);

  if (!req.body.id) return res.sendStatus(400);

  const userForActivation = await UserSchema.findById(req.body.id);

  if (!userForActivation) return res.sendStatus(404);

  userForActivation.isDeactivated = false;

  userForActivation.save();

  res.sendStatus(200);
});

router.post('/photo/deactivate', gatherUserInfo, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(401);

  const photoForDeactivation = await GalleryPhotosSchema.findById(req.body.id);

  if (!photoForDeactivation) return res.sendStatus(404);

  photoForDeactivation.isDeactivated = true;

  photoForDeactivation.save();

  res.sendStatus(200);
});

router.post('/photo/activate', gatherUserInfo, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(401);

  const photoForActivation = await GalleryPhotosSchema.findById(req.body.id);

  if (!photoForActivation) return res.sendStatus(404);

  photoForActivation.isDeactivated = false;

  photoForActivation.save();

  res.sendStatus(200);
});

module.exports = router;
