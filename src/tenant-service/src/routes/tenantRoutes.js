const express = require('express');
const router = express.Router();
const {
  registerTenant,
  loginTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  updateTenantStatus,
  updateTenantPassword,
  getTenantSummary
} = require('../controllers/tenantController');
const { verifyToken, isAdmin, isSelf } = require('../middleware/auth');

router.post('/auth/register', registerTenant);
router.post('/auth/login', loginTenant);

router.route('/tenants')
  .get(verifyToken, isAdmin, getTenants);

router.route('/tenants/:id')
  .get(verifyToken, isSelf, getTenantById)
  .put(verifyToken, isSelf, updateTenant)
  .delete(verifyToken, isAdmin, deleteTenant);

router.put('/tenants/:id/status', verifyToken, isAdmin, updateTenantStatus);
router.put('/tenants/:id/password', verifyToken, isSelf, updateTenantPassword);
router.get('/tenants/:id/summary', verifyToken, isAdmin, getTenantSummary);

module.exports = router;
