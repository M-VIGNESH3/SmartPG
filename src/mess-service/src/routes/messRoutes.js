const express = require('express');
const router = express.Router();
const {
  getWeeklyMenu,
  createMenu,
  updateMenu,
  optInMeal,
  optOutMeal,
  getOrdersByTenant,
  calculateBill
} = require('../controllers/messController');
const { protect, admin } = require('../middleware/auth');

// Menu routes
router.route('/menu')
  .post(protect, admin, createMenu);
router.get('/menu/weekly', protect, getWeeklyMenu);
router.put('/menu/:id', protect, admin, updateMenu);

// Order routes
router.post('/orders/opt-in', protect, optInMeal);
router.post('/orders/opt-out', protect, optOutMeal);
router.get('/orders/tenant/:id', protect, getOrdersByTenant);

// Bill routes
router.get('/mess/bill/:tenantId', protect, calculateBill);

module.exports = router;
