const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gatherUserInfo = require('./Middleware/gatherUserInfo');
const cookieParser = require('cookie-parser');
const ConversationsSchema = require('./DataSchemas/Conversations.js');
const UsersSchema = require('./DataSchemas/Users.js');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.DATABASE_CONNECTION_STRING);

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: 'http://localhost:5173', credentials: true } });

io.on('connection', (socket) => {
  socket.on('join_conversation', async (data) => {
    if (socket.handshake.headers.cookie) {
      const userId = jwt.verify(
        cookie.parse(socket.handshake.headers.cookie).accesstoken,
        process.env.ACCESS_TOKEN_SECRET
      ).uid;

      if ((await ConversationsSchema.findById(data)).participants.includes(userId)) {
        socket.join(data);
      }
    }
  });

  socket.on('send-message', async (data) => {
    if (socket.handshake.headers.cookie) {
      const userId = jwt.verify(
        cookie.parse(socket.handshake.headers.cookie).accesstoken,
        process.env.ACCESS_TOKEN_SECRET
      ).uid;

      if ((await ConversationsSchema.findById(data.room)).participants.includes(userId)) {
        socket.to(data.room).emit('recieve-message', { ...data, isDelivered: true });
      }
    }
  });

  socket.on('typing', ({ convId }) => {
    console.log(convId);
    socket.to(convId).emit('typing', convId);
  });
});

app.post('/createConversation', gatherUserInfo, async (req, res) => {
  const otherUserId = req.body.uid;

  if (!(await ConversationsSchema.findOne({ participants: [req.user._id.toString(), otherUserId] })))
    if (otherUserId) {
      const conversation = {
        participants: [req.user._id.toString(), otherUserId],
        lastMessage: {},
        messages: [],
      };

      const createdConverstion = await ConversationsSchema.create(conversation);

      res.json({ convId: createdConverstion._id });
    } else {
      res.sendStatus(400);
    }
  else {
    const converstionId = (await ConversationsSchema.findOne({ participants: [req.user._id.toString(), otherUserId] }))
      ._id;
    res.json({ convId: converstionId });
  }
});

app.post('/conversation', gatherUserInfo, async (req, res) => {
  const convId = req.body.convId;

  const conversation = await ConversationsSchema.findById(convId);

  if (conversation) {
    if (conversation.participants.includes(req.user._id.toString())) {
      const updatedConversation = {
        reciever: await UsersSchema.findById(
          conversation.participants.filter((participant) => participant !== req.user._id.toString())[0],
          'username profilePicture'
        ),
        id: conversation._id.toString(),
        messages: conversation.messages,
      };
      res.json(updatedConversation);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);
  }
});

app.post('/send-message/:convId', gatherUserInfo, async (req, res) => {
  const conversation = await ConversationsSchema.findById(req.params.convId);
  if (!conversation) return res.sendStatus(404);
  if (conversation.participants.includes(req.user._id.toString())) {
    req.body.sequenceNumber = conversation.messages.length;
    req.body.isDelivered = true;
    conversation.messages.push(req.body);
    conversation.lastSentMessage = req.body;
    await conversation.save();
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});
server.listen(5000);
