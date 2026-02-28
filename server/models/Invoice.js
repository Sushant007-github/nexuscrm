const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number }
});

const invoiceSchema = new mongoose.Schema({
  organizationId: { type: String, required: true },
  invoiceNumber: { type: String, unique: true },
  record: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
  customerName: { type: String, required: true },
  customerEmail: String,
  customerPhone: String,
  customerAddress: String,

  lineItems: [lineItemSchema],
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },

  status: { type: String, enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'], default: 'draft' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'online', 'insurance'] },
  paidAmount: { type: Number, default: 0 },
  dueDate: Date,
  paidDate: Date,

  notes: String,
  terms: String,
  industry: { type: String, default: 'core' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments({ organizationId: this.organizationId });
    this.invoiceNumber = `INV-${this.organizationId.toUpperCase().slice(-4)}-${String(count + 1).padStart(5, '0')}`;
  }
  // Calculate totals
  this.subtotal = this.lineItems.reduce((sum, item) => {
    item.total = item.quantity * item.unitPrice * (1 - item.discount / 100);
    return sum + item.total;
  }, 0);
  this.taxAmount = this.lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice * item.taxRate / 100);
  }, 0);
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
  next();
});

invoiceSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
