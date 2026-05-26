const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:      String,
  extractedText: String,
  matchedSkills: [String],
  missingSkills: [String],
  matchScore:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);