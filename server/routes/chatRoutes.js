const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  getMessages,
} = require('../controllers/chatController');
const auth = require('../middleware/auth');

// All chat routes require authentication
router.use(auth);

router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/:id/join', joinRoom);
router.post('/:id/leave', leaveRoom);
router.get('/:id/messages', getMessages);

module.exports = router;
