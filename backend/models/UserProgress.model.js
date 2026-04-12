const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  difficulty: String,
  topic: String,
  platform: String,
  companies: [String],
  pattern: String,
  starred: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);