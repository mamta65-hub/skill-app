const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     String,
  category: String,
  trend:    String,
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);