const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const UsersSchema = require('../DataSchemas/Users.js');
const ConversationsSchema = require('../DataSchemas/Conversations.js');
const RevokedTokensSchema = require('../DataSchemas/RevokedTokens.js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const sendEmail = require('../Utils/emailSender.js');
const serverConfig = require('../serverConfig.js');

const signUpMiddleware = require('../Middleware/signUpMiddleware.js');
const gatherUserInfo = require('../Middleware/gatherUserInfo.js');
const formatNumber = require('../Utils/formatNumber.js');
const sendSMS = require('../Utils/smsSender.js');

router.post('/signUp', signUpMiddleware, async (req, res) => {
  //Hashing inputed password
  const hashedPassword = await bcrypt.hash(req.user.password.trim(), 10);
  //creating user record on the database
  UsersSchema.create({
    username: req.user.username.trim(),
    fullName: req.user.fullname.trim(),
    password: hashedPassword,
    email: req.user.email.trim(),
    profilePicture:
      'https://floxly-bucket.s3.eu-north-1.amazonaws.com/profilePictures/defaultProfilePicture.png',
  }).then(async (user) => {
    res.status(201).send('User created!');
  });
});

router.post('/login', async (req, res) => {
  const user = req.body;
  if (user.email && user.password) {
    const fetchedUser = await UsersSchema.findOne({ email: user.email });
    if (fetchedUser) {
      //Hashing and comparing inputed password to potential user's hashed password
      if (await bcrypt.compare(user.password, fetchedUser.password)) {
        if (fetchedUser.isDeactivated)
          return res
            .status(403)
            .json({ notification: 'This account is deactivated!' });
        //creating expire date for ref and accsess tokens cookies
        const refTokenExpDate = new Date();
        refTokenExpDate.setDate(
          refTokenExpDate.getDate() + serverConfig.refTokenLifetime
        );

        const accessTokenExpDate = new Date();
        accessTokenExpDate.setTime(
          accessTokenExpDate.getTime() + serverConfig.accessTokenLiftime
        );

        const accessToken = jwt.sign(
          {
            uid: fetchedUser._id.toString(),
            expire: accessTokenExpDate.getTime(),
          },
          process.env.ACCESS_TOKEN_SECRET
        );
        //setting cookies containing tokens
        res.cookie('accesstoken', accessToken, {
          sameSite: 'strict',
          httpOnly: true,
          expires: accessTokenExpDate,
        });

        const refreshToken = jwt.sign(
          {
            uid: fetchedUser._id.toString(),
            expire: refTokenExpDate.getTime(),
          },
          process.env.REFRESH_TOKEN_SECRET
        );
        res.cookie('reftoken', refreshToken, {
          sameSite: 'strict',
          httpOnly: true,
          expires: refTokenExpDate,
          path: '/auth',
        });
        res.sendStatus(200);
      } else {
        res.status(400).json({ errors: { password: 'Invalid password!' } });
      }
    } else {
      res.status(404).json({ errors: { email: 'This email does not exist!' } });
    }
  } else {
    res.status(400).send('Invalid data!');
  }
});

router.get('/user', gatherUserInfo, async (req, res) => {
  const foundUser = req.user;

  if (foundUser.isDeactivated)
    return res.status(404).send('This account is deactivated');

  const conversations = await ConversationsSchema.find(
    { participants: req.user._id.toString() },
    '-messages'
  );
  const updatedConversations = [];
  const searchHistory = [];

  //Preparing user's conversations
  for (const conversation of conversations) {
    if (conversation.lastSentMessage) {
      updatedConversations.push({
        _id: conversation._id.toString(),
        reciever: await UsersSchema.findById(
          conversation.participants.filter(
            (participant) => participant !== req.user._id.toString()
          )[0],
          'profilePicture username -_id'
        ),
        lastMessage: conversation.lastSentMessage,
        dateCreated: conversation.dateCreated,
      });
    }
  }

  //Preparing searched results
  for (const search of foundUser.searchHistory) {
    const searchedUser = await UsersSchema.findById(search).select(
      'profilePicture username fullName'
    );

    searchHistory.push(searchedUser);
  }

  //Sorting the conversations by last sent message date
  updatedConversations.sort((a, b) => {
    const dateA = a.lastMessage?.dateSent || a.dateCreated.getTime();
    console.log(dateA);
    const dateB = b.lastMessage?.dateSent || b.dateCreated.getTime();
    return dateB - dateA;
  });

  let suggestedAccounts = await UsersSchema.aggregate([
    {
      $match: {
        followers: { $not: { $elemMatch: { $eq: req.user._id.toString() } } },
        privateAccount: false,
      },
    },
    {
      $addFields: {
        followersCount: { $size: '$followers' },
      },
    },
    {
      $sort: { followersCount: -1 },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        profilePicture: 1,
      },
    },
  ]);

  suggestedAccounts = suggestedAccounts.filter(
    (account) => account._id.toString() !== req.user._id.toString()
  );

  if (foundUser) {
    res.status(200).json({
      uid: foundUser._id.toString(),
      username: foundUser.username,
      fullName: foundUser.fullName,
      email: foundUser.email,
      followers: foundUser.followers,
      following: foundUser.following,
      posts: foundUser.posts,
      preferredHashtags: foundUser.preferredHashtags,
      createdAt: foundUser.createdAt,
      profilePicture: foundUser.profilePicture,
      privateAccount: foundUser.privateAccount,
      conversations: updatedConversations,
      bestFriends: foundUser.bestFriends,
      searchHistory: searchHistory.reverse(),
      suggestedAccounts,
      role: foundUser.role,
    });
  } else {
    res.sendStatus(404);
  }
});

router.get('/logout', async (req, res) => {
  const reftoken = req.cookies['reftoken'];

  //Removing ref and access token cookies

  if (reftoken) {
    res.clearCookie('reftoken', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/auth',
    });
    res.clearCookie('accesstoken');
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

router.post('/forgotPassword', async (req, res) => {
  const email = req.body.email;
  const user = await UsersSchema.findOne({ email });

  if (user) {
    const passwordToken = jwt.sign(
      { uid: user._id.toString(), exp: Date.now() + 300000 },
      process.env.ACCESS_TOKEN_SECRET
    );
    user.forgotPasswordToken = passwordToken;
    user.save();
    sendEmail({
      email,
      subject: 'Reset passsword',
      text: `Hey ${
        user.username
      },\n\nYou have requested to reset your password. A link is prepared for you to reset your password, but it will expire after 5 minutes.\nClick the link: ${`http://localhost:5173/reset-password?t=${passwordToken}`}\n\nThanks Floxly!`,
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.post('/resetPassword', async (req, res) => {
  const token = req.body.token;
  const updatedPassword = req.body.password;
  const decodedToken = jwt.decode(token);

  if (decodedToken.exp > Date.now()) {
    const user = await UsersSchema.findOne({ forgotPasswordToken: token });

    if (user) {
      if (!updatedPassword.length < 8) {
        user.password = await bcrypt.hash(updatedPassword, 10);
        user.forgotPasswordToken = '';
        user.save();
        res.sendStatus(200);
      } else {
        res.status(400).json({ password: 'Password too short!' });
      }
    } else {
      res.status(400).send('Invalid token!');
    }
  } else {
    res.status(400).send('Token expired!');
  }
});

router.post('/checkForgotPasswordToken', async (req, res) => {
  const token = req.body.token;
  try {
    const decodedToken = jwt.decode(token);
    if (!decodedToken)
      return res.status(400).json({ message: 'Token expired!' });
    if (decodedToken.exp > Date.now()) {
      const user = await UsersSchema.findOne({ forgotPasswordToken: token });
      if (user) {
        res.sendStatus(200);
      } else {
        res.status(400).json({ message: 'Invalid token!' });
      }
    } else {
      res.status(400).json({ message: 'Token expired!' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Invalid token!' });
  }
});

router.get('/refreshToken', async (req, res) => {
  const reftoken = req.cookies['reftoken'];
  if (!reftoken) return res.sendStatus(404);

  const decodedToken = jwt.verify(reftoken, process.env.REFRESH_TOKEN_SECRET);

  if (
    (await RevokedTokensSchema.findOne({ token: reftoken })) ||
    decodedToken.expire < Date.now()
  )
    return res.status(400).send('Token expired!');

  const accessTokenExpDate = new Date();
  accessTokenExpDate.setTime(
    accessTokenExpDate.getTime() + serverConfig.accessTokenLiftime
  );
  const accessToken = jwt.sign(
    { uid: decodedToken.uid, expire: accessTokenExpDate.getTime() },
    process.env.ACCESS_TOKEN_SECRET
  );

  res.cookie('accesstoken', accessToken, {
    sameSite: 'strict',
    httpOnly: true,
    expires: accessTokenExpDate,
  });
  res.sendStatus(200);
});

router.post('/enablePrivateAccount', gatherUserInfo, async (req, res) => {
  const fetchedUser = await UsersSchema.findById(req.user._id);

  fetchedUser.privateAccount = true;
  fetchedUser.save();
  res.json({ success: { message: 'Your account is now private!' } });
});

router.post('/disablePrivateAccount', gatherUserInfo, async (req, res) => {
  const fetchedUser = await UsersSchema.findById(req.user._id);

  fetchedUser.privateAccount = false;
  fetchedUser.save();
  res.json({ success: { message: 'Your account is not private!' } });
});

module.exports = router;
