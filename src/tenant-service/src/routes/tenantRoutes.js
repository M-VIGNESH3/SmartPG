const express = require('express');
const router = express.Router();
const {
  registerTenant,
  loginTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant
} = require('../controllers/tenantController');
const { protect, admin } = require('../middleware/auth');

router.post('/auth/register', registerTenant);
router.post('/auth/login', loginTenant);

router.route('/tenants')
  .get(protect, admin, getTenants);

router.route('/tenants/:id')
  .get(protect, getTenantById)
  .put(protect, updateTenant)
  .delete(protect, admin, deleteTenant);

module.exports = router;
