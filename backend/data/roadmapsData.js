const roadmaps = {
  'Machine Learning': {
    nodes: [
      { id: '1', label: 'Python Basics',        category: 'Foundation' },
      { id: '2', label: 'Math & Statistics',     category: 'Foundation' },
      { id: '3', label: 'Data Preprocessing',    category: 'Core' },
      { id: '4', label: 'Supervised Learning',   category: 'Core' },
      { id: '5', label: 'Unsupervised Learning', category: 'Core' },
      { id: '6', label: 'Model Evaluation',      category: 'Advanced' },
      { id: '7', label: 'Deep Learning',         category: 'Advanced' },
      { id: '8', label: 'Deploy ML Models',      category: 'Expert' },
    ],
    edges: [
      { source: '1', target: '2' }, { source: '1', target: '3' },
      { source: '2', target: '4' }, { source: '3', target: '4' },
      { source: '3', target: '5' }, { source: '4', target: '6' },
      { source: '5', target: '6' }, { source: '6', target: '7' },
      { source: '7', target: '8' },
    ],
  },
  'React.js': {
    nodes: [
      { id: '1', label: 'HTML & CSS',        category: 'Foundation' },
      { id: '2', label: 'JavaScript ES6+',   category: 'Foundation' },
      { id: '3', label: 'React Basics',      category: 'Core' },
      { id: '4', label: 'Hooks & State',     category: 'Core' },
      { id: '5', label: 'React Router',      category: 'Core' },
      { id: '6', label: 'State Management',  category: 'Advanced' },
      { id: '7', label: 'API Integration',   category: 'Advanced' },
      { id: '8', label: 'Testing & Deploy',  category: 'Expert' },
    ],
    edges: [
      { source: '1', target: '2' }, { source: '2', target: '3' },
      { source: '3', target: '4' }, { source: '3', target: '5' },
      { source: '4', target: '6' }, { source: '5', target: '7' },
      { source: '6', target: '8' }, { source: '7', target: '8' },
    ],
  },
  'Data Analysis': {
    nodes: [
      { id: '1', label: 'Excel & Sheets',       category: 'Foundation' },
      { id: '2', label: 'SQL Basics',           category: 'Foundation' },
      { id: '3', label: 'Python for Data',      category: 'Core' },
      { id: '4', label: 'Pandas & NumPy',       category: 'Core' },
      { id: '5', label: 'Data Visualization',   category: 'Core' },
      { id: '6', label: 'Statistical Analysis', category: 'Advanced' },
      { id: '7', label: 'Dashboard Building',   category: 'Advanced' },
      { id: '8', label: 'Predictive Analytics', category: 'Expert' },
    ],
    edges: [
      { source: '1', target: '2' }, { source: '2', target: '3' },
      { source: '3', target: '4' }, { source: '4', target: '5' },
      { source: '5', target: '6' }, { source: '5', target: '7' },
      { source: '6', target: '8' }, { source: '7', target: '8' },
    ],
  },
  'UI/UX Design': {
    nodes: [
      { id: '1', label: 'Design Principles',  category: 'Foundation' },
      { id: '2', label: 'Color & Typography', category: 'Foundation' },
      { id: '3', label: 'Wireframing',        category: 'Core' },
      { id: '4', label: 'Figma Basics',       category: 'Core' },
      { id: '5', label: 'Prototyping',        category: 'Core' },
      { id: '6', label: 'User Research',      category: 'Advanced' },
      { id: '7', label: 'Usability Testing',  category: 'Advanced' },
      { id: '8', label: 'Design Systems',     category: 'Expert' },
    ],
    edges: [
      { source: '1', target: '2' }, { source: '1', target: '3' },
      { source: '2', target: '4' }, { source: '3', target: '4' },
      { source: '4', target: '5' }, { source: '5', target: '6' },
      { source: '6', target: '7' }, { source: '7', target: '8' },
    ],
  },
  'Digital Marketing': {
    nodes: [
      { id: '1', label: 'Marketing Basics',   category: 'Foundation' },
      { id: '2', label: 'SEO Fundamentals',   category: 'Foundation' },
      { id: '3', label: 'Content Marketing',  category: 'Core' },
      { id: '4', label: 'Social Media',       category: 'Core' },
      { id: '5', label: 'Email Marketing',    category: 'Core' },
      { id: '6', label: 'Paid Ads (PPC)',     category: 'Advanced' },
      { id: '7', label: 'Analytics & KPIs',   category: 'Advanced' },
      { id: '8', label: 'Growth Strategy',    category: 'Expert' },
    ],
    edges: [
      { source: '1', target: '2' }, { source: '1', target: '3' },
      { source: '2', target: '4' }, { source: '3', target: '5' },
      { source: '4', target: '6' }, { source: '5', target: '6' },
      { source: '6', target: '7' }, { source: '7', target: '8' },
    ],
  },
};

function generateGenericRoadmap(skillName) {
  return {
    nodes: [
      { id: '1', label: `${skillName} Basics`,     category: 'Foundation' },
      { id: '2', label: 'Core Concepts',            category: 'Foundation' },
      { id: '3', label: 'Hands-on Practice',        category: 'Core' },
      { id: '4', label: 'Build Projects',           category: 'Core' },
      { id: '5', label: 'Advanced Techniques',      category: 'Advanced' },
      { id: '6', label: 'Real-world Applications',  category: 'Advanced' },
      { id: '7', label: `${skillName} Mastery`,     category: 'Expert' },
    ],
    edges: [
      { source: '1', target: '2' }, { source: '2', target: '3' },
      { source: '3', target: '4' }, { source: '4', target: '5' },
      { source: '5', target: '6' }, { source: '6', target: '7' },
    ],
  };
}

module.exports = { roadmaps, generateGenericRoadmap };