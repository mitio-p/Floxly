const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const UsersSchema = require("./DataSchemas/Users.js");
const ConversationsSchema = require("./DataSchemas/Conversations.js");
const RevokedTokensSchema = require("./DataSchemas/RevokedTokens.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const sendEmail = require("./Utils/emailSender.js");
const serverConfig = require("./serverConfig");

const signUpMiddleware = require("./Middleware/signUpMiddleware.js");
const gatherUserInfo = require("./Middleware/gatherUserInfo.js");
const formatNumber = require("./Utils/formatNumber.js");
const sendSMS = require("./Utils/smsSender.js");

mongoose.connect(process.env.DATABASE_CONNECTION_STRING);

app.use(express.json());

app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.post("/auth/signUp", signUpMiddleware, async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.user.password, 10);
  UsersSchema.create({
    username: req.user.username,
    fullName: req.user.fullname,
    password: hashedPassword,
    email: req.user.email,
    profilePicture:
      "https://floxly-bucket.s3.eu-north-1.amazonaws.com/profilePictures/defaultProfilePicture.png",
  }).then(async (user) => {
    res.status(201).send("User created!");
  });
});

app.post("/auth/login", async (req, res) => {
  const user = req.body;
  if (user.email && user.password) {
    const fetchedUser = await UsersSchema.findOne({ email: user.email });
    if (fetchedUser) {
      if (await bcrypt.compare(user.password, fetchedUser.password)) {
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
        res.cookie("accesstoken", accessToken, {
          sameSite: "strict",
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
        res.cookie("reftoken", refreshToken, {
          sameSite: "strict",
          httpOnly: true,
          expires: refTokenExpDate,
          path: "/auth",
        });
        res.sendStatus(200);
      } else {
        res.status(400).json({ errors: { password: "Invalid password!" } });
      }
    } else {
      res.status(404).json({ errors: { email: "This email does not exist!" } });
    }
  } else {
    res.status(400).send("Invalid data!");
  }
});

app.get("/auth/user", gatherUserInfo, async (req, res) => {
  const foundUser = req.user;
  const conversations = await ConversationsSchema.find(
    { participants: req.user._id.toString() },
    "-messages"
  );
  const updatedConversations = [];
  const searchHistory = [];

  for (const conversation of conversations) {
    if (conversation.lastSentMessage) {
      updatedConversations.push({
        _id: conversation._id.toString(),
        reciever: await UsersSchema.findById(
          conversation.participants.filter(
            (participant) => participant !== req.user._id.toString()
          )[0],
          "profilePicture username -_id"
        ),
        lastMessage: conversation.lastSentMessage,
        dateCreated: conversation.dateCreated,
      });
    }
  }

  for (const search of foundUser.searchHistory) {
    const searchedUser = await UsersSchema.findById(search).select(
      "profilePicture username fullName"
    );

    searchHistory.push(searchedUser);
  }

  updatedConversations.sort((a, b) => {
    const dateA = a.lastMessage?.dateSent || a.dateCreated.getTime();
    console.log(dateA);
    const dateB = b.lastMessage?.dateSent || b.dateCreated.getTime();
    return dateB - dateA;
  });

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
      searchHistory,
      role: foundUser.role,
    });
  } else {
    res.sendStatus(404);
  }
});

app.get("/auth/logout", async (req, res) => {
  const reftoken = req.cookies["reftoken"];

  if (reftoken) {
    res.clearCookie("reftoken", {
      httpOnly: true,
      sameSite: "strict",
      path: "/auth",
    });
    res.clearCookie("accesstoken");
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.post("/auth/forgotPassword", async (req, res) => {
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
      subject: "Reset passsword",
      text: `Hey ${
        user.username
      },\n\nYou have requested to reset your password. A link is prepared for you to reset your password, but it will expire after 5 minutes.\nClick the link: ${`http://localhost:5173/reset-password?t=${passwordToken}`}\n\nThanks Floxly!`,
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.post("/auth/resetPassword", async (req, res) => {
  const token = req.body.token;
  const updatedPassword = req.body.password;
  const decodedToken = jwt.decode(token);

  if (decodedToken.exp > Date.now()) {
    const user = await UsersSchema.findOne({ forgotPasswordToken: token });

    if (user) {
      if (!updatedPassword.length < 8) {
        user.password = await bcrypt.hash(updatedPassword, 10);
        user.forgotPasswordToken = "";
        user.save();
        res.sendStatus(200);
      } else {
        res.status(400).json({ password: "Password too short!" });
      }
    } else {
      res.status(400).send("Invalid token!");
    }
  } else {
    res.status(400).send("Token expired!");
  }
});

app.post("/auth/checkForgotPasswordToken", async (req, res) => {
  const token = req.body.token;
  try {
    const decodedToken = jwt.decode(token);
    if (!decodedToken)
      return res.status(400).json({ message: "Token expired!" });
    if (decodedToken.exp > Date.now()) {
      const user = await UsersSchema.findOne({ forgotPasswordToken: token });
      if (user) {
        res.sendStatus(200);
      } else {
        res.status(400).json({ message: "Invalid token!" });
      }
    } else {
      res.status(400).json({ message: "Token expired!" });
    }
  } catch (err) {
    res.status(400).json({ message: "Invalid token!" });
  }
});

app.get("/auth/refreshToken", async (req, res) => {
  const reftoken = req.cookies["reftoken"];
  if (!reftoken) return res.sendStatus(404);

  const decodedToken = jwt.verify(reftoken, process.env.REFRESH_TOKEN_SECRET);

  if (
    (await RevokedTokensSchema.findOne({ token: reftoken })) ||
    decodedToken.expire < Date.now()
  )
    return res.status(400).send("Token expired!");

  const accessTokenExpDate = new Date();
  accessTokenExpDate.setTime(
    accessTokenExpDate.getTime() + serverConfig.accessTokenLiftime
  );
  const accessToken = jwt.sign(
    { uid: decodedToken.uid, expire: accessTokenExpDate.getTime() },
    process.env.ACCESS_TOKEN_SECRET
  );

  res.cookie("accesstoken", accessToken, {
    sameSite: "strict",
    httpOnly: true,
    expires: accessTokenExpDate,
  });
  res.sendStatus(200);
});

app.post("/auth/enablePrivateAccount", gatherUserInfo, async (req, res) => {
  const fetchedUser = await UsersSchema.findById(req.user._id);

  fetchedUser.privateAccount = true;
  fetchedUser.save();
  res.json({ success: { message: "Your account is now private!" } });
});

app.post("/auth/disablePrivateAccount", gatherUserInfo, async (req, res) => {
  const fetchedUser = await UsersSchema.findById(req.user._id);

  fetchedUser.privateAccount = false;
  fetchedUser.save();
  res.json({ success: { message: "Your account is not private!" } });
});

app.listen(3000);
