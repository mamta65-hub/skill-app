const User    = require('../models/User');
const UserBadge = require('../models/UserBadge');
const { createNotification } = require('./notificationService');

const LEVELS = [
  { level: 1, minXP: 0,    title: '🌱 Beginner'     },
  { level: 2, minXP: 100,  title: '📚 Learner'       },
  { level: 3, minXP: 250,  title: '⚡ Practitioner'  },
  { level: 4, minXP: 500,  title: '🔥 Skilled'       },
  { level: 5, minXP: 1000, title: '💎 Expert'         },
  { level: 6, minXP: 2000, title: '🏆 Master'         },
];

function getLevelFromXP(xp) {
  let currentLevel = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) currentLevel = l;
  }
  return currentLevel;
}

async function addXP(userId, points, skill) {
  const user     = await User.findById(userId);
  const oldLevel = getLevelFromXP(user.xp);
  user.xp       += points;
  const newLevel = getLevelFromXP(user.xp);
  user.level     = newLevel.level;
  await user.save();

  // Notify level up
  if (newLevel.level > oldLevel.level) {
    await createNotification(
      userId,
      'admin_announcement',
      `🎉 Level Up! You are now ${newLevel.title}`,
      `You earned ${points} XP and reached level ${newLevel.level}!`,
      '/challenges'
    );
  }

  return { xp: user.xp, level: newLevel };
}

async function awardBadge(userId, badge, skill, description) {
  const existing = await UserBadge.findOne({ userId, badge });
  if (existing) return null;

  const newBadge = await UserBadge.create({ userId, badge, skill, description });
  await createNotification(
    userId,
    'admin_announcement',
    `🏅 New Badge Earned: ${badge}`,
    `You earned the ${badge} badge for completing the ${skill} challenge!`,
    '/challenges'
  );
  return newBadge;
}

module.exports = { addXP, awardBadge, getLevelFromXP, LEVELS };