import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  MiniMap, Controls, Background,
  addEdge, useNodesState, useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '../context/ThemeContext';
import API_BASE from '../config/api';

const CATEGORY_COLORS = {
  Foundation: '#000000',
  Core:       '#374151',
  Advanced:   '#6B7280',
  Expert:     '#9CA3AF',
};

function SkillNode({ data }) {
  return (
    <div onClick={data.onToggle} style={{
      background:   data.completed ? '#000' : '#fff',
      color:        data.completed ? '#fff' : '#000',
      border:       `2px solid ${CATEGORY_COLORS[data.category] || '#000'}`,
      borderRadius: 12,
      padding:      '10px 16px',
      minWidth:     160,
      textAlign:    'center',
      cursor:       'pointer',
      transition:   'all 0.2s',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{data.label}</div>
      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{data.category}</div>
      {data.completed && <div style={{ fontSize: 10, marginTop: 2 }}>✅ Done</div>}
    </div>
  );
}

const nodeTypes = { skillNode: SkillNode };

export default function RoadmapPage() {
  const { dark } = useTheme();
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const headers   = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [roadmaps, setRoadmaps]             = useState([]);
  const [active,   setActive]               = useState(null);
  const [nodes,    setNodes, onNodesChange] = useNodesState([]);
  const [edges,    setEdges, onEdgesChange] = useEdgesState([]);
  const [newSkill, setNewSkill]             = useState('');
  const [newNode,  setNewNode]              = useState('');
  const [saving,   setSaving]               = useState(false);
  const [loading,  setLoading]              = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/roadmaps`, { headers })
      .then((r) => r.json())
      .then((data) => { setRoadmaps(data); setLoading(false); });
  }, []);

  const loadRoadmap = (roadmap) => {
    setActive(roadmap);
    setNodes(roadmap.nodes.map((n) => ({
      id:       n.id,
      type:     'skillNode',
      position: n.position || { x: 0, y: 0 },
      data: {
        label:    n.label,
        category: n.category,
        completed: n.completed,
        onToggle: () => toggleNode(roadmap, n.id),
      },
    })));
    setEdges(roadmap.edges.map((e) => ({
      id:       e.id,
      source:   e.source,
      target:   e.target,
      animated: true,
      style:    { stroke: dark ? '#fff' : '#000' },
    })));
  };

  const toggleNode = (roadmap, nodeId) => {
    const updated = {
      ...roadmap,
      nodes: roadmap.nodes.map((n) =>
        n.id === nodeId ? { ...n, completed: !n.completed } : n
      ),
    };
    saveRoadmap(updated);
  };

  const saveRoadmap = async (roadmap) => {
    setSaving(true);
    const res = await fetch(`${API_BASE}/api/roadmaps/${roadmap._id}`, {
      method:  'PUT',
      headers,
      body:    JSON.stringify({ nodes: roadmap.nodes, edges: roadmap.edges }),
    });
    const updated = await res.json();
    setRoadmaps((prev) => prev.map((r) => r._id === updated._id ? updated : r));
    loadRoadmap(updated);
    setSaving(false);
  };

  const generateRoadmap = async () => {
    if (!newSkill.trim()) return;
    const res = await fetch(`${API_BASE}/api/roadmaps/generate`, {
      method: 'POST', headers,
      body:   JSON.stringify({ skillName: newSkill }),
    });
    const roadmap = await res.json();
    setRoadmaps((prev) => prev.find((r) => r._id === roadmap._id) ? prev : [...prev, roadmap]);
    loadRoadmap(roadmap);
    setNewSkill('');
  };

  const addCustomNode = () => {
    if (!newNode.trim() || !active) return;
    const id  = `custom-${Date.now()}`;
    const newN = { id, label: newNode, category: 'Core', completed: false, position: { x: Math.random() * 400, y: Math.random() * 300 } };
    saveRoadmap({ ...active, nodes: [...active.nodes, newN] });
    setNewNode('');
  };

  const onConnect = useCallback((params) => {
    if (!active) return;
    const newEdge = { id: `e-${params.source}-${params.target}`, source: params.source, target: params.target };
    saveRoadmap({ ...active, edges: [...active.edges, newEdge] });
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: dark ? '#fff' : '#000' } }, eds));
  }, [active, dark]);

  const deleteRoadmap = async (id) => {
    await fetch(`${API_BASE}/api/roadmaps/${id}`, { method: 'DELETE', headers });
    setRoadmaps((prev) => prev.filter((r) => r._id !== id));
    if (active?._id === id) { setActive(null); setNodes([]); setEdges([]); }
  };

  const progress = active
    ? Math.round((active.nodes.filter((n) => n.completed).length / active.nodes.length) * 100)
    : 0;

  const base = `min-h-screen p-6 transition-colors duration-300 ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;
  const card = `rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;

  return (
    <div className={base}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🗺️ Skill Roadmap Generator</h1>
        <button onClick={() => navigate('/dashboard')}
          className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">
          ← Dashboard
        </button>
      </div>

      {/* Generate */}
      <div className="flex gap-3 mb-6">
        <input className={`flex-1 border p-3 rounded-xl ${dark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          placeholder="Enter skill (e.g. React.js, Machine Learning...)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateRoadmap()} />
        <button onClick={generateRoadmap}
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold">
          ⚡ Generate
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0">
          <h2 className={`font-semibold mb-3 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your Roadmaps
          </h2>
          {loading && <p className="text-gray-400 text-sm">Loading...</p>}
          {!loading && !roadmaps.length && (
            <p className="text-gray-400 text-sm">No roadmaps yet. Generate one!</p>
          )}
          <div className="flex flex-col gap-2">
            {roadmaps.map((r) => (
              <div key={r._id} onClick={() => loadRoadmap(r)}
                className={`p-3 rounded-xl cursor-pointer border transition flex justify-between items-center
                  ${active?._id === r._id
                    ? 'bg-black text-white border-black'
                    : `${dark ? 'bg-gray-800 border-gray-700 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-black'}`}`}>
                <span className="text-sm font-medium truncate">{r.skillName}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteRoadmap(r._id); }}
                  className="text-xs opacity-50 hover:opacity-100 ml-2">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1">
          {!active ? (
            <div className={`${card} flex items-center justify-center`} style={{ height: 400 }}>
              <p className="text-gray-400">Select or generate a roadmap to view it</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-xl font-bold">{active.skillName}</h2>
                  <p className="text-sm text-gray-500">
                    {active.nodes.filter((n) => n.completed).length}/{active.nodes.length} steps completed
                  </p>
                </div>
                {saving && <span className="text-xs text-gray-400">Saving...</span>}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div className="bg-black dark:bg-white h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }} />
              </div>

              {/* ReactFlow */}
              <div className={`${card} overflow-hidden`} style={{ height: 460, padding: 0 }}>
                <ReactFlow nodes={nodes} edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView>
                  <MiniMap />
                  <Controls />
                  <Background gap={16} color={dark ? '#374151' : '#f0f0f0'} />
                </ReactFlow>
              </div>

              {/* Add custom node */}
              <div className="flex gap-3 mt-4">
                <input className={`flex-1 border p-3 rounded-xl text-sm ${dark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Add a custom step..."
                  value={newNode}
                  onChange={(e) => setNewNode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomNode()} />
                <button onClick={addCustomNode}
                  className="bg-gray-800 text-white px-5 py-2 rounded-xl text-sm">
                  + Add Step
                </button>
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-3 flex-wrap">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    {cat}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}