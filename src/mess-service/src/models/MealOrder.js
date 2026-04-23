const mongoose = require('mongoose');

const mealOrderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  optIn: { type: Boolean, default: true },
  cost: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MealOrder', mealOrderSchema);
