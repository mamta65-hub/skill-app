const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Challenge      = require('../models/Challenge');
const UserChallenge  = require('../models/UserChallenge');
const UserBadge      = require('../models/UserBadge');
const { addXP, awardBadge, getLevelFromXP } = require('../utils/xpService');
const User           = require('../models/User');

// GET all challenges (filtered by skill or type)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { skill, type } = req.query;
    const filter = { isActive: true };
    if (skill) filter.skill = skill;
    if (type)  filter.type  = type;

    const challenges = await Challenge.find(filter).sort({ createdAt: -1 });

    // Get user's completed challenges
    const completed = await UserChallenge.find({ userId: req.user.id, completed: true })
      .select('challengeId');
    const completedIds = completed.map((c) => c.challengeId.toString());

    const result = challenges.map((c) => ({
      ...c.toObject(),
      isCompleted: completedIds.includes(c._id.toString()),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch challenges', error: err.message });
  }
});

// GET single challenge
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const userChallenge = await UserChallenge.findOne({
      userId: req.user.id,
      challengeId: req.params.id,
    });

    res.json({ challenge, userProgress: userChallenge });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch challenge' });
  }
});

// POST submit challenge answers
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const challenge   = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    // Check already completed
    const existing = await UserChallenge.findOne({
      userId: req.user.id, challengeId: req.params.id, completed: true,
    });
    if (existing) return res.status(400).json({ message: 'Already completed!' });

    // Grade answers
    let totalPoints = 0;
    const gradedAnswers = answers.map((ans, i) => {
      const question    = challenge.questions[i];
      let isCorrect     = false;
      let pointsEarned  = 0;

      if (question.type === 'mcq') {
        isCorrect    = ans.answer === question.correctAnswer;
        pointsEarned = isCorrect ? question.points : 0;
      } else {
        // theory/coding — give full points if answered
        isCorrect    = ans.answer && ans.answer.trim().length > 10;
        pointsEarned = isCorrect ? question.points : Math.floor(question.points * 0.5);
      }

      totalPoints += pointsEarned;
      return { questionIndex: i, answer: ans.answer, isCorrect, pointsEarned };
    });

    // Save user challenge
    const userChallenge = await UserChallenge.create({
      userId:      req.user.id,
      challengeId: req.params.id,
      answers:     gradedAnswers,
      completed:   true,
      totalPoints,
      badge:       challenge.badge,
      completedAt: new Date(),
    });

    // Add XP
    const xpResult = await addXP(req.user.id, totalPoints, challenge.skill);

    // Award badge if score > 60%
    let badgeAwarded = null;
    if (totalPoints >= challenge.totalPoints * 0.6) {
      badgeAwarded = await awardBadge(
        req.user.id,
        challenge.badge,
        challenge.skill,
        `Completed ${challenge.title}`
      );
    }

    res.json({
      message:      'Challenge submitted!',
      totalPoints,
      gradedAnswers,
      xp:           xpResult,
      badge:        badgeAwarded,
      passed:       totalPoints >= challenge.totalPoints * 0.6,
    });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed', error: err.message });
  }
});

// GET user stats (XP, level, badges)
router.get('/user/stats', authMiddleware, async (req, res) => {
  try {
    const user       = await User.findById(req.user.id).select('xp level name');
    const badges     = await UserBadge.find({ userId: req.user.id });
    const completed  = await UserChallenge.find({ userId: req.user.id, completed: true })
      .populate('challengeId', 'title skill difficulty');

    const { getLevelFromXP, LEVELS } = require('../utils/xpService');
    const currentLevel = getLevelFromXP(user.xp);
    const nextLevel    = LEVELS.find((l) => l.level === currentLevel.level + 1);
    const xpToNext     = nextLevel ? nextLevel.minXP - user.xp : 0;

    res.json({
      xp:           user.xp,
      level:        currentLevel,
      nextLevel,
      xpToNext,
      badges,
      completedChallenges: completed,
      totalCompleted: completed.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;