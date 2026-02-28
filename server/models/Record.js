const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const activitySchema = new mongoose.Schema({
  action: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed
});

const recordSchema = new mongoose.Schema({
  organizationId: { type: String, required: true },
  type: { type: String, enum: ['contact', 'patient', 'student', 'customer', 'table', 'order'], required: true },
  industry: { type: String, enum: ['core', 'hospital', 'restaurant', 'school'], default: 'core' },

  // Core fields
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'pending', 'closed', 'completed'], default: 'active' },
  tags: [String],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [noteSchema],
  activities: [activitySchema],

  // Hospital fields
  patientId: String,
  admissionType: { type: String, enum: ['OPD', 'IPD', 'ICU', 'Emergency'] },
  ward: String,
  doctorAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  diagnosis: String,
  admissionDate: Date,
  dischargeDate: Date,

  // Restaurant fields
  tableNumber: Number,
  orderItems: [{
    name: String, quantity: Number, price: Number, notes: String
  }],
  orderStatus: { type: String, enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'] },
  totalAmount: Number,

  // School fields
  studentId: String,
  grade: String,
  section: String,
  parentName: String,
  parentPhone: String,
  feeStatus: { type: String, enum: ['paid', 'partial', 'unpaid'] },
  enrollmentDate: Date,

  // Custom metadata
  customFields: mongoose.Schema.Types.Mixed,

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

recordSchema.index({ organizationId: 1, type: 1, status: 1 });
recordSchema.index({ name: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Record', recordSchema);
