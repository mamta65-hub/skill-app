const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: Date, default: Date.now },
  learned:  { type: Number, default: 0 },
  roadmaps: { type: Number, default: 0 },
});

module.exports = mongoose.model('Progress', progressSchema);