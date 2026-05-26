const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  interests: { type: [String], default: [] },
  isAdmin:   { type: Boolean, default: false },
  xp:        { type: Number, default: 0 },
  level:     { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);