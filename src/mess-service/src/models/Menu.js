const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  dayOfWeek: { 
    type: String, 
    required: true, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  breakfast: [{ type: String }],
  lunch: [{ type: String }],
  dinner: [{ type: String }],
  isVeg: { type: Boolean, default: true },
  note: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
