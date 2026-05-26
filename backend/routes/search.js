const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Skill          = require('../models/Skill');
const Roadmap        = require('../models/Roadmap');
const Challenge      = require('../models/Challenge');
const User           = require('../models/User');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ skills: [], roadmaps: [], challenges: [], users: [] });
    }

    const regex = new RegExp(q, 'i');

    const [skills, roadmaps, challenges, users] = await Promise.all([
      Skill.find({ $or: [{ name: regex }, { category: regex }] }).limit(5),
      Roadmap.find({ userId: req.user.id, skillName: regex }).limit(5),
      Challenge.find({ $or: [{ title: regex }, { skill: regex }] }).limit(5),
      User.find({ name: regex }).select('name email xp').limit(5),
    ]);

    res.json({ skills, roadmaps, challenges, users });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

module.exports = router;