const mongoose = require('mongoose');

const dsaProblemSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  slug:       { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic:      { type: String, required: true },
  sheet:      { type: String, required: true },
  // e.g: "Striver A2Z", "Striver SDE", "Blind 75", "NeetCode 150"
  step:       { type: String, default: '' },
  // e.g: "Step 1: Learn the Basics"
  order:      { type: Number, default: 0 },
  // Problem ka sequence number sheet mein
  leetcodeUrl:  { type: String, default: '' },
  gfgUrl:       { type: String, default: '' },
  articleUrl:   { type: String, default: '' },
  youtubeUrl:   { type: String, default: '' },
  isPremium:    { type: Boolean, default: false },
}, { timestamps: true });

// Index for fast queries
dsaProblemSchema.index({ sheet: 1, topic: 1, order: 1 });

module.exports = mongoose.model('DSAProblem', dsaProblemSchema);