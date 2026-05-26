const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name:     String,
  category: String,
  trend:    String,
});

module.exports = mongoose.model('Skill', skillSchema);