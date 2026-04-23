const express = require('express');
const router = express.Router();
const {
  getRooms,
  getAvailableRooms,
  allocateRoom
} = require('../controllers/roomController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, getRooms);
router.get('/available', protect, getAvailableRooms);
router.post('/allocate', protect, admin, allocateRoom);

module.exports = router;
