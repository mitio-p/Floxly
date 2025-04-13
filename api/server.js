const express = require('express');
const app = express();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const gatherUserInfo = require('./Middleware/gatherUserInfo.js');
const ConversationsSchema = require('./DataSchemas/Conversations.js');
const UsersSchema = require('./DataSchemas/Users.js');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Auth = require('./routes/Auth.js');
const User = require('./routes/User.js');

app.use(express.json());

app.use(cookieParser());

app.use(express.text());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use('/floxly', User);

app.use('/auth', Auth);

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: 'http://localhost:5173', credentials: true } });

// Connecting to the database
mongoose
  .connect(process.env.DATABASE_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(3000, () => {
      console.log('Server running...');
    });
  })
  .catch((err) => {
    console.error(err);
  });

io.on('connection', (socket) => {
  socket.on('join_conversation', async (data) => {
    if (socket.handshake.headers.cookie) {
      const userId = jwt.verify(
        cookie.parse(socket.handshake.headers.cookie).accesstoken,
        process.env.ACCESS_TOKEN_SECRET
      ).uid;

      if ((await ConversationsSchema.findById(data)).participants.includes(userId)) {
        console.log('joined');
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
