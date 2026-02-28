const express = require('express');
const router = express.Router();
const { auth, authorize, auditLog } = require('../middleware/auth');
const Invoice = require('../models/Invoice');

// GET /api/invoices
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = { organizationId: req.organizationId };
    if (status) query.status = status;
    if (search) query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [invoices, total] = await Promise.all([
      Invoice.find(query).populate('createdBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Invoice.countDocuments(query)
    ]);
    res.json({ invoices, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices
router.post('/', auth, auditLog('CREATE', 'invoices'), async (req, res) => {
  try {
    const invoice = await Invoice.create({ ...req.body, organizationId: req.organizationId, createdBy: req.user._id });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, organizationId: req.organizationId }).populate('createdBy', 'name email');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/invoices/:id
router.put('/:id', auth, auditLog('UPDATE', 'invoices'), async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body, { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', auth, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    await Invoice.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/stats/revenue
router.get('/stats/revenue', auth, async (req, res) => {
  try {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { start: d, end: new Date(now.getFullYear(), now.getMonth() - i + 1, 0), label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) };
    }).reverse();

    const data = await Promise.all(months.map(async m => {
      const r = await Invoice.aggregate([
        { $match: { organizationId: req.organizationId, status: 'paid', paidDate: { $gte: m.start, $lte: m.end } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      return { month: m.label, revenue: r[0]?.total || 0, count: r[0]?.count || 0 };
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
