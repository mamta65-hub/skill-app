const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const Favorite = require('../models/Favorite');
const authMiddleware = require('../middleware/authMiddleware');
const { recalculateScore } = require('../utils/leaderboardService');

router.get('/', async (req, res) => {
  const skills = await Skill.find();
  res.json(skills);
});

router.post('/favorites', authMiddleware, async (req, res) => {
  try {
    const favorite = new Favorite({ ...req.body, userId: req.user.id });
    await favorite.save();
    await recalculateScore(req.user.id);
    res.json({ message: 'Saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Save failed', error: err.message });
  }
});

module.exports = router;