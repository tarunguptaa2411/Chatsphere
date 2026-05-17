const Room = require('../models/Room');
const Message = require('../models/Message');

// @desc    Create a new room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { name, description, roomType } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required.' });
    }

    const room = await Room.create({
      name,
      description: description || '',
      roomType: roomType || 'public',
      creator: req.user._id,
      members: [req.user._id],
    });

    await room.populate('creator', 'username avatar');
    await room.populate('members', 'username avatar status');

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create room.' });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ roomType: 'public' })
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Also include private rooms that the user is a member of
    const privateRooms = await Room.find({ 
      roomType: 'private', 
      members: req.user._id 
    })
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const allRooms = [...rooms, ...privateRooms];
    
    res.json(allRooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms.' });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar status lastSeen');

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch room.' });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/:id/join
exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Check if already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this room.' });
    }

    room.members.push(req.user._id);
    await room.save();

    await room.populate('members', 'username avatar status');
    await room.populate('creator', 'username avatar');

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to join room.' });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/:id/leave
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    room.members = room.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );
    await room.save();

    res.json({ message: 'Left the room successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave room.' });
  }
};

// @desc    Get messages for a room (paginated)
// @route   GET /api/rooms/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ room: req.params.id });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      hasMore: skip + messages.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
};
