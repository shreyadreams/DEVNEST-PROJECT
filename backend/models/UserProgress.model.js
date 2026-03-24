const mongoose = require('mongoose');

// Har user ka progress alag store hoga
// Ek user ne kaunsa problem solve kiya — yahan track hoga
const userProgressSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // User model se link
    required: true 
  },
  problem: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DSAProblem',  // DSAProblem model se link
    required: true 
  },
  solved: { type: Boolean, default: false },
  solvedAt: { type: Date },
  notes: { type: String, default: '' }, // User apna note likh sakta hai
  revisit: { type: Boolean, default: false }, // Baad mein dobara dekhna hai?

}, { timestamps: true });

// Ek user ek problem ko ek hi baar track kar sakta hai
userProgressSchema.index({ user: 1, problem: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);