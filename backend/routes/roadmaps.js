const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Roadmap = require('../models/Roadmap');
const { roadmaps, generateGenericRoadmap } = require('../data/roadmapsData');
const { createNotification } = require('../utils/notificationService');

function assignPositions(nodes, edges) {
  const levelMap = {};
  const visited = new Set();
  const rootIds = nodes.filter((n) => !edges.some((e) => e.target === n.id)).map((n) => n.id);
  const queue = rootIds.map((id) => ({ id, level: 0 }));
  while (queue.length) {
    const { id, level } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    levelMap[id] = level;
    edges.filter((e) => e.source === id).forEach((e) => queue.push({ id: e.target, level: level + 1 }));
  }
  const levelCount = {};
  return nodes.map((node) => {
    const level = levelMap[node.id] || 0;
    levelCount[level] = (levelCount[level] || 0) + 1;
    return { ...node, position: { x: level * 220, y: (levelCount[level] - 1) * 120 } };
  });
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userRoadmaps = await Roadmap.find({ userId: req.user.id });
    res.json(userRoadmaps);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roadmaps' });
  }
});

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { skillName } = req.body;
    if (!skillName) return res.status(400).json({ message: 'skillName required' });
    const existing = await Roadmap.findOne({ userId: req.user.id, skillName });
    if (existing) return res.json(existing);
    const template = roadmaps[skillName] || generateGenericRoadmap(skillName);
    const positionedNodes = assignPositions(template.nodes, template.edges);
    const edgesWithIds = template.edges.map((e, i) => ({ ...e, id: `e${i}-${e.source}-${e.target}` }));
    const roadmap = await Roadmap.create({ userId: req.user.id, skillName, nodes: positionedNodes, edges: edgesWithIds });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ message: 'Generation failed', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    const updated = await Roadmap.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { nodes, edges }, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Roadmap not found' });
    const completed = updated.nodes.filter((n) => n.completed).length;
    const total = updated.nodes.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    if ([25, 50, 75, 100].includes(pct)) {
      await createNotification(req.user.id, 'roadmap_progress', `🗺️ ${updated.skillName} Progress`, `You've completed ${pct}% of your ${updated.skillName} roadmap!`, '/roadmap');
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;