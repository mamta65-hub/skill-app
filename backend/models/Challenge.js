const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type:           { type: String, enum: ['mcq', 'coding', 'theory'], required: true },
  question:       { type: String, required: true },
  options:        [String],          // for MCQ
  correctAnswer:  String,            // for MCQ
  starterCode:    String,            // for coding
  expectedOutput: String,            // for coding
  hints:          [String],
  points:         { type: Number, default: 10 },
});

const challengeSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  skill:       { type: String, required: true },
  type:        { type: String, enum: ['daily', 'skill'], required: true },
  difficulty:  { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  questions:   [questionSchema],
  totalPoints: { type: Number, default: 0 },
  badge:       { type: String, default: '' },
  date:        { type: Date, default: Date.now },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);