const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');

router.get('/', auth, async (req, res) => {
  try {
    const { date, entityType, page = 1, limit = 50 } = req.query;
    const query = { organizationId: req.organizationId };
    if (entityType) query.entityType = entityType;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0)), $lte: new Date(d.setHours(23,59,59)) };
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      Attendance.find(query).populate('userId', 'name role avatar').populate('recordId', 'name').sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Attendance.countDocuments(query)
    ]);
    res.json({ records, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const record = await Attendance.create({ ...req.body, organizationId: req.organizationId, markedBy: req.user._id });
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const summary = await Attendance.aggregate([
      { $match: { organizationId: req.organizationId, date: { $gte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
