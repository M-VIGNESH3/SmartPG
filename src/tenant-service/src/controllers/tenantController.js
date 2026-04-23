const Tenant = require('../models/Tenant');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register new tenant
// @route POST /api/auth/register
exports.registerTenant = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const tenantExists = await Tenant.findOne({ email });

    if (tenantExists) {
      return res.status(400).json({ message: 'Tenant already exists' });
    }

    const tenant = await Tenant.create({ name, email, password, phone });

    if (tenant) {
      res.status(201).json({
        _id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        role: tenant.role,
        token: generateToken(tenant._id, tenant.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid tenant data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Auth tenant & get token
// @route POST /api/auth/login
exports.loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenant = await Tenant.findOne({ email });

    if (tenant && (await tenant.matchPassword(password))) {
      res.json({
        _id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        role: tenant.role,
        token: generateToken(tenant._id, tenant.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all tenants
// @route GET /api/tenants
exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({}).select('-password').populate('roomId');
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get tenant by ID
// @route GET /api/tenants/:id
exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).select('-password').populate('roomId');
    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update tenant
// @route PUT /api/tenants/:id
exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (tenant) {
      tenant.name = req.body.name || tenant.name;
      tenant.phone = req.body.phone || tenant.phone;
      if (req.body.password) {
        tenant.password = req.body.password;
      }
      const updatedTenant = await tenant.save();
      res.json({
        _id: updatedTenant._id,
        name: updatedTenant.name,
        email: updatedTenant.email,
        phone: updatedTenant.phone
      });
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete tenant
// @route DELETE /api/tenants/:id
exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (tenant) {
      await tenant.deleteOne();
      res.json({ message: 'Tenant removed' });
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
