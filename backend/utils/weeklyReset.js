const cron = require('node-cron');
const LeaderboardScore = require('../models/LeaderboardScore');
const { broadcastNotification } = require('./notificationService');

function startWeeklyReset() {
  cron.schedule('0 0 * * 1', async () => {
    try {
      await LeaderboardScore.deleteMany({});
      await broadcastNotification(
        'admin_announcement',
        '🏆 New Leaderboard Week Started!',
        'The weekly leaderboard has reset. Start saving skills and completing roadmaps!',
        '/leaderboard'
      );
      console.log('✅ Leaderboard reset complete');
    } catch (err) {
      console.error('Reset failed:', err.message);
    }
  });
  console.log('⏰ Weekly leaderboard reset scheduled');
}

module.exports = { startWeeklyReset };