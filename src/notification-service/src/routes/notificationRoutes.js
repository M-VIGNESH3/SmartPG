const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotificationsByTenant,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  announce,
  deleteNotification,
  getAllNotifications,
  deleteByTenant
} = require('../controllers/notificationController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/', verifyToken, isAdmin, createNotification);
router.post('/announce', verifyToken, isAdmin, announce);

router.get('/all', verifyToken, isAdmin, getAllNotifications);
router.get('/:tenantId', verifyToken, getNotificationsByTenant);
router.get('/count/:tenantId', verifyToken, getUnreadCount);

router.put('/:id/read', verifyToken, markAsRead);
router.put('/read-all/:tenantId', verifyToken, markAllAsRead);

router.delete('/:id', verifyToken, isAdmin, deleteNotification);
router.delete('/tenant/:tenantId', verifyToken, isAdmin, deleteByTenant);

module.exports = router;
