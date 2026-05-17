const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

// Track online users: Map<userId, { socketId, username, avatar }>
const onlineUsers = new Map();

module.exports = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    const username = socket.user.username;

    console.log(`🟢 ${username} connected (${socket.id})`);

    // Add user to online tracking
    onlineUsers.set(userId, {
      socketId: socket.id,
      username: socket.user.username,
      avatar: socket.user.avatar,
      userId,
    });

    // Update user status in DB
    await User.findByIdAndUpdate(userId, { status: 'online' });

    // Broadcast updated online users list
    io.emit('online_users', Array.from(onlineUsers.values()));

    // ----- Join Room -----
    socket.on('join_room', async (roomId) => {
      try {
        socket.join(roomId);
        console.log(`📌 ${username} joined room ${roomId}`);

        // Notify room that user joined
        socket.to(roomId).emit('user_joined', {
          userId,
          username,
          avatar: socket.user.avatar,
          roomId,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ----- Leave Room -----
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`📤 ${username} left room ${roomId}`);

      socket.to(roomId).emit('user_left', {
        userId,
        username,
        roomId,
      });
    });

    // ----- Send Message -----
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, messageType = 'text', fileUrl = '', fileName = '' } = data;

        // Create and save message to DB
        const message = await Message.create({
          content,
          sender: userId,
          room: roomId,
          messageType,
          fileUrl,
          fileName,
          readBy: [userId],
        });

        // Populate sender info
        await message.populate('sender', 'username avatar');

        // Update room's lastMessage
        await Room.findByIdAndUpdate(roomId, { 
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        // Broadcast message to room (including sender for confirmation)
        io.to(roomId).emit('new_message', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ----- Typing Indicators -----
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', {
        userId,
        username,
        roomId,
      });
    });

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('user_stop_typing', {
        userId,
        username,
        roomId,
      });
    });

    // ----- Mark Messages as Read -----
    socket.on('mark_read', async ({ roomId }) => {
      try {
        await Message.updateMany(
          { room: roomId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // ----- Disconnect -----
    socket.on('disconnect', async () => {
      console.log(`🔴 ${username} disconnected (${socket.id})`);

      onlineUsers.delete(userId);

      // Update user status in DB
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date(),
      });

      // Broadcast updated online users
      io.emit('online_users', Array.from(onlineUsers.values()));
    });
  });
};
