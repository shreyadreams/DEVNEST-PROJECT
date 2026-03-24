const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// USER SCHEMA — Shape of every document in the 'users' collection
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
                                         // select: false → never return in queries
  username: { type: String, unique: true, sparse: true, lowercase: true },
  avatar:   { type: String, default: '' },
  bio:      { type: String, default: '' },
  techStack: [String],

  // External platform usernames — used to fetch stats later
  githubUsername:   { type: String, default: '' },
  leetcodeUsername: { type: String, default: '' },
  linkedinUrl:      { type: String, default: '' },

  // Array of problem IDs the user has marked solved
  solvedProblems: [{ type: String }],

}, { timestamps: true }); // adds createdAt + updatedAt auto

// PRE-SAVE HOOK
// Runs every time a user document is saved
// If password was changed → hash it before storing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password unchanged
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// INSTANCE METHOD
// Called on a user document to compare passwords
// e.g: const isMatch = await user.matchPassword(req.body.password)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
