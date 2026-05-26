const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Favorite = require('../models/Favorite');
const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');

router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [totalUsers, totalSkills, totalFavorites, totalRoadmaps] =
      await Promise.all([User.countDocuments(), Skill.countDocuments(), Favorite.countDocuments(), Roadmap.countDocuments()]);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const topSkills = await Favorite.aggregate([{ $group: { _id: '$name', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
    const signupTrend = await User.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%m/%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ totalUsers, totalSkills, totalFavorites, totalRoadmaps, newUsers, topSkills, signupTrend });
  } catch (err) {
    res.status(500).json({ message: 'Stats failed', error: err.message });
  }
});

router.get('/users', adminMiddleware, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/users/:id/toggle-admin', adminMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isAdmin = !user.isAdmin;
  await user.save();
  res.json({ message: 'Updated', isAdmin: user.isAdmin });
});

router.delete('/users/:id', adminMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Favorite.deleteMany({ userId: req.params.id });
  await Roadmap.deleteMany({ userId: req.params.id });
  await Progress.deleteMany({ userId: req.params.id });
  res.json({ message: 'Deleted' });
});

router.get('/skills', adminMiddleware, async (req, res) => { res.json(await Skill.find()); });
router.post('/skills', adminMiddleware, async (req, res) => { res.json(await Skill.create(req.body)); });
router.put('/skills/:id', adminMiddleware, async (req, res) => { res.json(await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true })); });
router.delete('/skills/:id', adminMiddleware, async (req, res) => { await Skill.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });

router.get('/roadmaps', adminMiddleware, async (req, res) => {
  const r = await Roadmap.find().populate('userId', 'name email').sort({ createdAt: -1 });
  res.json(r);
});
router.delete('/roadmaps/:id', adminMiddleware, async (req, res) => {
  await Roadmap.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;