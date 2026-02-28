const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

router.get('/', auth, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource } = req.query;
    const query = { organizationId: req.organizationId };
    if (action) query.action = action;
    if (resource) query.resource = resource;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query).populate('userId', 'name avatar').sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
      AuditLog.countDocuments(query)
    ]);
    res.json({ logs, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
