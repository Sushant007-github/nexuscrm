const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions for this action' });
  }
  next();
};

const auditLog = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (res.statusCode < 400) {
      const AuditLog = require('../models/AuditLog');
      AuditLog.create({
        organizationId: req.organizationId,
        userId: req.user?._id,
        userEmail: req.user?.email,
        action,
        resource,
        resourceId: req.params?.id || data?._id,
        details: { method: req.method, path: req.path, body: req.body },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }).catch(console.error);
    }
    return originalJson(data);
  };
  next();
};

module.exports = { auth, authorize, auditLog };
