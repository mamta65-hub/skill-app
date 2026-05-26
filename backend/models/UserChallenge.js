const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  answer:        String,
  isCorrect:     Boolean,
  pointsEarned:  Number,
});

const userChallengeSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  answers:     [answerSchema],
  completed:   { type: Boolean, default: false },
  totalPoints: { type: Number, default: 0 },
  badge:       { type: String, default: '' },
  startedAt:   { type: Date, default: Date.now },
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('UserChallenge', userChallengeSchema);