const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintsByTenant,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, createComplaint)
  .get(protect, admin, getComplaints);

router.get('/tenant/:id', protect, getComplaintsByTenant);

router.route('/:id')
  .get(protect, getComplaintById)
  .delete(protect, admin, deleteComplaint);

router.put('/:id/status', protect, admin, updateComplaintStatus);

module.exports = router;
