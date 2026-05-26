const skillsBank = require('../data/skillsData');

function extractSkillsFromText(text) {
  const normalizedText = text.toLowerCase();
  const matched = [];
  const missing = [];

  skillsBank.forEach((skill) => {
    const skillName = skill.name.toLowerCase();
    const tags      = skill.tags || [];
    const found     = normalizedText.includes(skillName) ||
      tags.some((tag) => normalizedText.includes(tag));

    if (found) {
      matched.push(skill.name);
    } else {
      missing.push(skill.name);
    }
  });

  const matchScore = Math.round((matched.length / skillsBank.length) * 100);
  return { matched, missing: missing.slice(0, 10), matchScore };
}

module.exports = { extractSkillsFromText };