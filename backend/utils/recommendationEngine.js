const skillsBank = require('../data/skillsData');

function getRecommendations(interests = [], savedSkillNames = []) {
  if (!interests.length) return skillsBank.slice(0, 6);
  const normalizedInterests = interests.map((i) => i.toLowerCase());
  const scored = skillsBank
    .filter((skill) => !savedSkillNames.includes(skill.name))
    .map((skill) => {
      const matchScore = skill.tags.filter((tag) => normalizedInterests.includes(tag)).length;
      const trendScore = parseFloat(skill.trend) / 100;
      const finalScore = matchScore * 0.7 + trendScore * 0.3;
      return { ...skill, score: finalScore };
    });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
}

module.exports = { getRecommendations };