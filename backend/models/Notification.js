const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['recommendation', 'roadmap_progress', 'admin_announcement'],
    required: true
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  link:    { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);