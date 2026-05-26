const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');
const User = require('../models/User');

async function createNotification(userId, type, title, message, link = '') {
  const notification = await Notification.create({ userId, type, title, message, link });
  const user = await User.findById(userId);
  if (user?.email) {
    if (type === 'recommendation') {
      const skillNames = message.match(/•\s(.+)/g)?.map((s) => s.replace('• ', '')) || [message];
      sendEmail(user.email, 'recommendation', user.name, skillNames);
    } else if (type === 'roadmap_progress') {
      const pct = parseInt(message.match(/(\d+)%/)?.[1]) || 0;
      const skillName = title.replace('🗺️ ', '').replace(' Progress', '');
      sendEmail(user.email, 'roadmap_progress', user.name, skillName, pct);
    } else if (type === 'admin_announcement') {
      sendEmail(user.email, 'admin_announcement', user.name, title, message);
    }
  }
  return notification;
}

async function broadcastNotification(type, title, message, link = '') {
  const users = await User.find({ isAdmin: false }).select('_id email name');
  await Promise.all(users.map((u) => createNotification(u._id, type, title, message, link)));
}

module.exports = { createNotification, broadcastNotification };