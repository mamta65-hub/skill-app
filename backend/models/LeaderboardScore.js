const mongoose = require('mongoose');

function getWeekStart() {
  const now  = new Date();
  const day  = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

const leaderboardSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skillsSaved:       { type: Number, default: 0 },
  roadmapsCompleted: { type: Number, default: 0 },
  progressScore:     { type: Number, default: 0 },
  combinedScore:     { type: Number, default: 0 },
  weekStart:         { type: Date, default: () => getWeekStart() },
}, { timestamps: true });

leaderboardSchema.statics.getWeekStart = getWeekStart;

module.exports = mongoose.model('LeaderboardScore', leaderboardSchema);