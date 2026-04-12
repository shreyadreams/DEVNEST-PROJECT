const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Workspace = require('../models/UserProgress.model'); // correct file

// GET all problems for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const { topic, difficulty, platform, company, search, starred } = req.query;
    const filter = { user: req.user._id };

    if (topic)      filter.topic      = new RegExp(topic, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (platform)   filter.platform   = platform;
    if (company)    filter.companies  = { $in: [new RegExp(company, 'i')] };
    if (starred === 'true') filter.starred = true;
    if (search)     filter.title      = new RegExp(search, 'i');

    const problems = await Workspace.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST — add new problem
router.post('/', protect, async (req, res) => {
  try {
    const problem = await Workspace.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT — update problem
router.put('/:id', protect, async (req, res) => {
  try {
    const problem = await Workspace.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!problem) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE — remove problem
router.delete('/:id', protect, async (req, res) => {
  try {
    await Workspace.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const total  = await Workspace.countDocuments({ user: userId });
    const byDiff = await Workspace.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    const byTopic = await Workspace.aggregate([
      { $match: { user: userId, topic: { $ne: '' } } },
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    const byPattern = await Workspace.aggregate([
      { $match: { user: userId, pattern: { $ne: '' } } },
      { $group: { _id: '$pattern', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, total, byDiff, byTopic, byPattern });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;