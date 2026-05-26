const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const { getRecommendations } = require('../utils/recommendationEngine');
const { createNotification } = require('../utils/notificationService');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const saved = await Favorite.find({ userId: req.user.id });
    const savedNames = saved.map((s) => s.name);
    const recommendations = getRecommendations(user.interests, savedNames);

    if (recommendations.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const alreadyNotified = await Notification.findOne({
        userId: req.user.id,
        type: 'recommendation',
        createdAt: { $gte: today },
      });
      if (!alreadyNotified) {
        const skillList = recommendations
          .slice(0, 3)
          .map((s) => `• ${s.name}`)
          .join('\n');
        await createNotification(
          req.user.id,
          'recommendation',
          'New Skills Recommended',
          `Based on your interests:\n${skillList}`,
          '/dashboard'
        );
      }
    }
    res.json({ recommendations, interests: user.interests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recommendations', error: err.message });
  }
});

module.exports = router;