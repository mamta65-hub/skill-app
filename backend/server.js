const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const authRoutes           = require('./routes/auth');
const skillRoutes          = require('./routes/skills');
const recommendationRoutes = require('./routes/recommendations');
const analyticsRoutes      = require('./routes/analytics');
const roadmapRoutes        = require('./routes/roadmaps');
const adminRoutes          = require('./routes/admin');
const notificationRoutes   = require('./routes/notifications');
const leaderboardRoutes    = require('./routes/leaderboard');
const challengeRoutes      = require('./routes/challenges');
const resumeRoutes         = require('./routes/resume');
const profileRoutes        = require('./routes/profile');
const searchRoutes         = require('./routes/search');
const { startWeeklyReset } = require('./utils/weeklyReset');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://skill-app-six.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/randomskills')
  .then(() => console.log('MongoDB connected ✓'))
  .catch((err) => console.error(err));

app.use('/api/auth',            authRoutes);
app.use('/api/skills',          skillRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics',       analyticsRoutes);
app.use('/api/roadmaps',        roadmapRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/notifications',   notificationRoutes);
app.use('/api/leaderboard',     leaderboardRoutes);
app.use('/api/challenges',      challengeRoutes);
app.use('/api/resume',          resumeRoutes);
app.use('/api/profile',         profileRoutes);
app.use('/api/search',          searchRoutes);

startWeeklyReset();

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);