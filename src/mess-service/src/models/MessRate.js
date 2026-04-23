const mongoose = require('mongoose');

const messRateSchema = new mongoose.Schema({
  ratePerMeal: { type: Number, required: true, default: 50 }
});

module.exports = mongoose.model('MessRate', messRateSchema);
