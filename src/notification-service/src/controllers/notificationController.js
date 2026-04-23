const Notification = require('../models/Notification');

// @desc Create a generic notification (Internal use by other services)
// @route POST /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const { tenantId, title, message, type } = req.body;
    const notification = await Notification.create({
      tenantId,
      title,
      message,
      type
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create broadcast announcement
// @route POST /api/notifications/announce
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const notification = await Notification.create({
      tenantId: null, // Broadcast
      title,
      message,
      type: 'announcement'
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get notifications for a tenant (including broadcasts)
// @route GET /api/notifications/:tenantId
exports.getNotifications = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const notifications = await Notification.find({
      $or: [{ tenantId }, { tenantId: null }]
    }).sort({ createdAt: -1 }).limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get unread count
// @route GET /api/notifications/count/:tenantId
exports.getUnreadCount = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const count = await Notification.countDocuments({
      $or: [{ tenantId }, { tenantId: null }],
      isRead: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.isRead = true;
      await notification.save();
      res.json(notification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark all notifications as read for a tenant
// @route PUT /api/notifications/read-all/:tenantId
exports.markAllAsRead = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    await Notification.updateMany(
      { $or: [{ tenantId }, { tenantId: null }], isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
