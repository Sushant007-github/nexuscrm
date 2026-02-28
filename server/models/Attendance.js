const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  organizationId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' }, // for students/patients
  entityType: { type: String, enum: ['staff', 'student', 'patient'], default: 'staff' },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ['present', 'absent', 'late', 'half_day', 'leave'], default: 'present' },
  notes: String,
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

attendanceSchema.index({ organizationId: 1, date: -1, entityType: 1 });
attendanceSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
