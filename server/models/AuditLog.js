const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  organizationId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  action: { type: String, required: true }, // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW
  resource: String, // records, invoices, users, etc.
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

auditLogSchema.index({ organizationId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
