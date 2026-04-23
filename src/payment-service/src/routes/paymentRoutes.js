const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  getPaymentsByTenant,
  updatePaymentStatus,
  getPaymentSummary
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, admin, createPayment)
  .get(protect, admin, getPayments);

router.get('/summary', protect, admin, getPaymentSummary);
router.get('/tenant/:id', protect, getPaymentsByTenant);
router.put('/:id/status', protect, admin, updatePaymentStatus);

module.exports = router;
