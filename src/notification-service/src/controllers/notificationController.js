const Notification = require('../models/Notification');

exports.createNotification = async (req, res) => {
  try {
    const { tenantId, title, message, type } = req.body;
    const notification = await Notification.create({ tenantId, title, message, type });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.announce = async (req, res) => {
  try {
    const { title, message, type, tenantId } = req.body;
    const target = tenantId && tenantId !== 'All Tenants' ? tenantId : null;
    const notification = await Notification.create({ tenantId: target, title, message, type });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotificationsByTenant = async (req, res) => {
  try {
    if (req.user.role === 'tenant' && req.params.tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const notifications = await Notification.find({
      $or: [
        { tenantId: req.params.tenantId },
        { tenantId: null }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    if (req.user.role === 'tenant' && req.params.tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const count = await Notification.countDocuments({
      $or: [
        { tenantId: req.params.tenantId },
        { tenantId: null }
      ],
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (req.user.role === 'tenant' && notification.tenantId && notification.tenantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.isRead = true;
    const updated = await notification.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    if (req.user.role === 'tenant' && req.params.tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Notification.updateMany(
      {
        $or: [
          { tenantId: req.params.tenantId },
          { tenantId: null }
        ],
        isRead: false
      },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    await notification.deleteOne();
    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteByTenant = async (req, res) => {
  try {
    await Notification.deleteMany({ tenantId: req.params.tenantId });
    res.json({ message: 'All tenant notifications removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
