const express = require('express');
const router = express.Router();
const {
  createNotification,
  createAnnouncement,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

// Internal / cross-service route (Not strictly protected for simplicity in this demo, but should ideally use internal auth or network policies)
router.post('/', createNotification);

// Admin routes
router.post('/announce', protect, admin, createAnnouncement);

// Tenant routes
router.get('/:tenantId', protect, getNotifications);
router.get('/count/:tenantId', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all/:tenantId', protect, markAllAsRead);

module.exports = router;
