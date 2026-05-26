const LeaderboardScore = require('../models/LeaderboardScore');
const Favorite = require('../models/Favorite');
const Roadmap = require('../models/Roadmap');

async function recalculateScore(userId) {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const skillsSaved = await Favorite.countDocuments({ userId, createdAt: { $gte: weekStart } });
  const roadmaps = await Roadmap.find({ userId });

  let roadmapsCompleted = 0;
  let progressScore = 0;
  roadmaps.forEach((r) => {
    const total = r.nodes.length || 1;
    const completed = r.nodes.filter((n) => n.completed).length;
    const pct = Math.round((completed / total) * 100);
    progressScore += pct;
    if (pct === 100) roadmapsCompleted++;
  });

  const avgProgress = roadmaps.length ? progressScore / roadmaps.length : 0;
  const combinedScore = skillsSaved * 10 + roadmapsCompleted * 50 + Math.round(avgProgress);

  await LeaderboardScore.findOneAndUpdate(
    { userId },
    { userId, skillsSaved, roadmapsCompleted, progressScore, combinedScore, weekStart },
    { upsert: true, new: true }
  );
}

module.exports = { recalculateScore };