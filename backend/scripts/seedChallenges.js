require('dotenv').config();
const mongoose  = require('mongoose');
const Challenge = require('../models/Challenge');
const challengesData = require('../data/challengesData');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/randomskills');
  await Challenge.deleteMany({});
  await Challenge.insertMany(challengesData);
  console.log('✅ Challenges seeded successfully!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });