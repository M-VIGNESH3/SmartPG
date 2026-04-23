const express = require('express');
const router = express.Router();
const {
  getWeeklyMenu,
  getTodayMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  optInMeal,
  optOutMeal,
  getOrdersByTenant,
  getTodayOrders,
  getTodayOrderStats,
  calculateBill,
  getMessRate,
  updateMessRate
} = require('../controllers/messController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Rate routes
router.get('/mess/rate', verifyToken, getMessRate);
router.put('/mess/rate', verifyToken, isAdmin, updateMessRate);

// Menu routes
router.get('/menu/weekly', verifyToken, getWeeklyMenu);
router.get('/menu/today', verifyToken, getTodayMenu);
router.post('/menu', verifyToken, isAdmin, createMenu);
router.route('/menu/:id')
  .put(verifyToken, isAdmin, updateMenu)
  .delete(verifyToken, isAdmin, deleteMenu);

// Order routes
router.post('/orders/opt-in', verifyToken, optInMeal);
router.post('/orders/opt-out', verifyToken, optOutMeal);
router.get('/orders/today', verifyToken, isAdmin, getTodayOrders);
router.get('/orders/today/stats', verifyToken, isAdmin, getTodayOrderStats);
router.get('/orders/tenant/:id', verifyToken, getOrdersByTenant);

// Bill routes
router.get('/mess/bill/:tenantId', verifyToken, calculateBill);

module.exports = router;
