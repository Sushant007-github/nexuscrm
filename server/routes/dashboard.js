const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Record = require('../models/Record');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// GET /api/dashboard/summary
router.get('/summary', auth, async (req, res) => {
  try {
    const orgId = req.organizationId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRecords, activeRecords, newThisMonth, newLastMonth,
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalUsers, recentActivity, invoiceSummary
    ] = await Promise.all([
      Record.countDocuments({ organizationId: orgId }),
      Record.countDocuments({ organizationId: orgId, status: 'active' }),
      Record.countDocuments({ organizationId: orgId, createdAt: { $gte: startOfMonth } }),
      Record.countDocuments({ organizationId: orgId, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Invoice.aggregate([{ $match: { organizationId: orgId, status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Invoice.aggregate([{ $match: { organizationId: orgId, status: 'paid', paidDate: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Invoice.aggregate([{ $match: { organizationId: orgId, status: 'paid', paidDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      User.countDocuments({ organizationId: orgId, isActive: true }),
      AuditLog.find({ organizationId: orgId }).sort({ timestamp: -1 }).limit(10).populate('userId', 'name avatar'),
      Invoice.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Monthly chart data (last 6 months)
    const monthlyData = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        return Promise.all([
          Invoice.aggregate([{ $match: { organizationId: orgId, status: 'paid', paidDate: { $gte: d, $lte: end } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
          Record.countDocuments({ organizationId: orgId, createdAt: { $gte: d, $lte: end } })
        ]).then(([rev, recs]) => ({
          month: d.toLocaleString('default', { month: 'short' }),
          revenue: rev[0]?.total || 0,
          records: recs
        }));
      })
    );

    const prevRevenue = lastMonthRevenue[0]?.total || 0;
    const currRevenue = monthRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
    const recordGrowth = newLastMonth > 0 ? ((newThisMonth - newLastMonth) / newLastMonth * 100).toFixed(1) : 0;

    res.json({
      kpis: {
        totalRecords,
        activeRecords,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: currRevenue,
        totalUsers,
        revenueGrowth: parseFloat(revenueGrowth),
        recordGrowth: parseFloat(recordGrowth)
      },
      charts: {
        monthly: monthlyData.reverse(),
        invoiceStatus: invoiceSummary
      },
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
