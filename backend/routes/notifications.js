const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Notification = require('../models/Notification');
const { createNotification, broadcastNotification } = require('../utils/notificationService');

router.get('/', authMiddleware, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
  res.json({ notifications, unreadCount });
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true });
  res.json({ message: 'Marked as read' });
});

router.patch('/read-all', authMiddleware, async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  res.json({ message: 'All marked as read' });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Deleted' });
});

router.post('/broadcast', adminMiddleware, async (req, res) => {
  const { title, message, link } = req.body;
  await broadcastNotification('admin_announcement', title, message, link);
  res.json({ message: 'Broadcast sent' });
});

module.exports = router;