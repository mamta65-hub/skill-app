const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const LeaderboardScore = require('../models/LeaderboardScore');
const { recalculateScore } = require('../utils/leaderboardService');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tab = 'combinedScore' } = req.query;
    const validTabs = ['combinedScore', 'skillsSaved', 'roadmapsCompleted'];
    const sortField = validTabs.includes(tab) ? tab : 'combinedScore';
    await recalculateScore(req.user.id);
    const scores = await LeaderboardScore.find().sort({ [sortField]: -1 }).limit(20).populate('userId', 'name email');
    const allScores = await LeaderboardScore.find().sort({ [sortField]: -1 }).select('userId');
    const myRank = allScores.findIndex((s) => s.userId.toString() === req.user.id) + 1;
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    res.json({
      scores: scores.map((s, i) => ({
        rank: i + 1,
        name: s.userId?.name || 'Unknown',
        email: s.userId?.email || '',
        skillsSaved: s.skillsSaved,
        roadmapsCompleted: s.roadmapsCompleted,
        progressScore: s.progressScore,
        combinedScore: s.combinedScore,
        isCurrentUser: s.userId?._id?.toString() === req.user.id,
      })),
      myRank,
      weekStart: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekEnd: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  } catch (err) {
    res.status(500).json({ message: 'Leaderboard failed', error: err.message });
  }
});

module.exports = router;