const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Record = require('../models/Record');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

router.get('/overview', auth, async (req, res) => {
  try {
    const orgId = req.organizationId;
    const [byType, byStatus, byIndustry, topUsers] = await Promise.all([
      Record.aggregate([{ $match: { organizationId: orgId } }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
      Record.aggregate([{ $match: { organizationId: orgId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Record.aggregate([{ $match: { organizationId: orgId } }, { $group: { _id: '$industry', count: { $sum: 1 } } }]),
      Record.aggregate([
        { $match: { organizationId: orgId, assignedTo: { $exists: true } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { count: 1, 'user.name': 1, 'user.avatar': 1 } }
      ])
    ]);
    res.json({ byType, byStatus, byIndustry, topUsers });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/revenue', auth, async (req, res) => {
  try {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const s = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const e = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 0);
      return { s, e, label: s.toLocaleString('default', { month: 'short' }) };
    });
    const data = await Promise.all(months.map(async m => {
      const r = await Invoice.aggregate([
        { $match: { organizationId: req.organizationId, status: 'paid', paidDate: { $gte: m.s, $lte: m.e } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      return { month: m.label, revenue: r[0]?.total || 0, invoices: r[0]?.count || 0 };
    }));
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
