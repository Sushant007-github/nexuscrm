const express = require('express');
const router = express.Router();
const { auth, authorize, auditLog } = require('../middleware/auth');
const Record = require('../models/Record');

// GET /api/records
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, status, industry, assignedTo } = req.query;
    const query = { organizationId: req.organizationId };

    if (type) query.type = type;
    if (status) query.status = status;
    if (industry) query.industry = industry;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      Record.find(query).populate('assignedTo', 'name avatar').populate('createdBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Record.countDocuments(query)
    ]);

    res.json({ records, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/records
router.post('/', auth, auditLog('CREATE', 'records'), async (req, res) => {
  try {
    const record = await Record.create({ ...req.body, organizationId: req.organizationId, createdBy: req.user._id });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/records/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('assignedTo', 'name avatar email').populate('notes.createdBy', 'name').populate('createdBy', 'name');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/records/:id
router.put('/:id', auth, auditLog('UPDATE', 'records'), async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/records/:id
router.delete('/:id', auth, authorize('admin', 'super_admin'), auditLog('DELETE', 'records'), async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/records/:id/notes
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { $push: { notes: { content: req.body.content, createdBy: req.user._id } } },
      { new: true }
    ).populate('notes.createdBy', 'name');
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
