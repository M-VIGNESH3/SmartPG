const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, default: null }, // null means broadcast
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['payment', 'complaint', 'mess', 'announcement', 'other'], default: 'other' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
