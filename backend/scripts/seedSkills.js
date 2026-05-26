require('dotenv').config();
const mongoose = require('mongoose');
const Skill = require('../models/Skill');

const skills = [
  { name: 'Machine Learning',   category: 'Technical',   trend: '92%' },
  { name: 'React.js',           category: 'Technical',   trend: '88%' },
  { name: 'Node.js',            category: 'Technical',   trend: '85%' },
  { name: 'Python',             category: 'Technical',   trend: '95%' },
  { name: 'TypeScript',         category: 'Technical',   trend: '87%' },
  { name: 'MongoDB',            category: 'Technical',   trend: '78%' },
  { name: 'UI/UX Design',       category: 'Design',      trend: '83%' },
  { name: 'Figma',              category: 'Design',      trend: '81%' },
  { name: 'Digital Marketing',  category: 'Business',    trend: '86%' },
  { name: 'Product Management', category: 'Business',    trend: '84%' },
  { name: 'Data Analysis',      category: 'Data',        trend: '91%' },
  { name: 'SQL',                category: 'Data',        trend: '82%' },
  { name: 'Public Speaking',    category: 'Soft Skills', trend: '75%' },
  { name: 'Leadership',         category: 'Soft Skills', trend: '78%' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/randomskills');
  await Skill.deleteMany({});
  await Skill.insertMany(skills);
  console.log('✅ Skills seeded successfully!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });