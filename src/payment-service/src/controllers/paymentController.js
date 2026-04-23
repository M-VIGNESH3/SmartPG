const Payment = require('../models/Payment');
const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005';

// @desc Create a new payment record
// @route POST /api/payments
exports.createPayment = async (req, res) => {
  try {
    const { tenantId, amount, month, year, description } = req.body;
    const payment = await Payment.create({
      tenantId,
      amount,
      month,
      year,
      description
    });
    
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
        tenantId,
        title: 'New Bill Generated',
        message: `A new bill of $${amount} for ${month} ${year} has been generated.`,
        type: 'payment'
      });
    } catch (err) {
      console.error('Failed to send notification', err.message);
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all payments
// @route GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get payments by tenant ID
// @route GET /api/payments/tenant/:id
exports.getPaymentsByTenant = async (req, res) => {
  try {
    const payments = await Payment.find({ tenantId: req.params.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update payment status
// @route PUT /api/payments/:id/status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    payment.status = status;
    if (status === 'completed') {
      payment.paymentDate = new Date();
    }
    
    const updatedPayment = await payment.save();

    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
        tenantId: payment.tenantId,
        title: 'Payment Status Updated',
        message: `Your payment for ${payment.month} ${payment.year} is now ${status}.`,
        type: 'payment'
      });
    } catch (err) {
      console.error('Failed to send notification', err.message);
    }

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get payment summary
// @route GET /api/payments/summary
exports.getPaymentSummary = async (req, res) => {
  try {
    const totalPending = await Payment.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCollected = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      pendingAmount: totalPending[0] ? totalPending[0].total : 0,
      collectedAmount: totalCollected[0] ? totalCollected[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
