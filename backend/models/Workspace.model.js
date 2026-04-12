const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Problem details
  title:      { type: String, required: true, trim: true },
  platform:   { type: String, enum: ['LeetCode', 'GFG', 'Codeforces', 'Coding Ninjas', 'HackerRank', 'Other'], default: 'LeetCode' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  url:        { type: String, default: '' },

  // DSA categorization
  topic:    { type: String, default: '' }, // Arrays, DP, Trees, etc.
  pattern:  { type: String, default: '' }, // Sliding Window, Two Pointer, etc.
  companies: [{ type: String }],           // Amazon, Google, etc.

  // Personal notes
  approach: { type: String, default: '' }, // How I solved it
  trick:    { type: String, default: '' }, // Key insight / trick
  timeComplexity:  { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },

  // Status
  status:   { type: String, enum: ['Solved', 'Attempted', 'To Review'], default: 'Solved' },
  starred:  { type: Boolean, default: false },
  revisitDate: { type: Date, default: null },

  solvedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);