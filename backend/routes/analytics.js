const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Favorite = require('../models/Favorite');
const Progress = require('../models/Progress');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const saved = await Favorite.find({ userId });

    const categoryMap = {};
    saved.forEach((s) => { categoryMap[s.category] = (categoryMap[s.category] || 0) + 1; });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    const trendData = saved.map((s) => ({ name: s.name, trend: parseFloat(s.trend) || 0 }));

    const progress = await Progress.find({ userId }).sort({ date: 1 });
    const progressData = progress.map((p) => ({
      date: p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      learned: p.learned,
      roadmaps: p.roadmaps,
    }));

    const allCategories = ['Technical', 'Design', 'Business', 'Data', 'Soft Skills'];
    const radarData = allCategories.map((cat) => ({
      category: cat,
      saved: saved.filter((s) => s.category === cat).length,
      fullMark: 5,
    }));

    res.json({
      stats: {
        totalSaved: saved.length,
        totalLearned: progress.reduce((acc, p) => acc + p.learned, 0),
        roadmapsCompleted: progress.reduce((acc, p) => acc + p.roadmaps, 0),
        topCategory: categoryData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A',
      },
      categoryData, trendData, progressData, radarData,
    });
  } catch (err) {
    res.status(500).json({ message: 'Analytics failed', error: err.message });
  }
});

module.exports = router;