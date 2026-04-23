const Complaint = require('../models/Complaint');
const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005';

// @desc Create new complaint
// @route POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { tenantId, title, description, category, priority } = req.body;
    const complaint = await Complaint.create({
      tenantId,
      title,
      description,
      category,
      priority
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all complaints
// @route GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get complaints by tenant
// @route GET /api/complaints/tenant/:id
exports.getComplaintsByTenant = async (req, res) => {
  try {
    const complaints = await Complaint.find({ tenantId: req.params.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get complaint by ID
// @route GET /api/complaints/:id
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (complaint) {
      res.json(complaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update complaint status
// @route PUT /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (complaint) {
      complaint.status = status;
      const updatedComplaint = await complaint.save();
      
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
          tenantId: complaint.tenantId,
          title: 'Complaint Status Updated',
          message: `Your complaint "${complaint.title}" is now ${status}.`,
          type: 'complaint'
        });
      } catch (err) {
        console.error('Failed to send notification', err.message);
      }

      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete complaint
// @route DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (complaint) {
      await complaint.deleteOne();
      res.json({ message: 'Complaint removed' });
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
