const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id:        String,
  label:     String,
  category:  String,
  completed: { type: Boolean, default: false },
  position:  { x: Number, y: Number },
});

const edgeSchema = new mongoose.Schema({
  id:     String,
  source: String,
  target: String,
});

const roadmapSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillName: { type: String, required: true },
  nodes:     [nodeSchema],
  edges:     [edgeSchema],
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);