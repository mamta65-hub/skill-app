const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge:       { type: String, required: true },
  skill:       { type: String, required: true },
  description: { type: String, default: '' },
  earnedAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserBadge', userBadgeSchema);