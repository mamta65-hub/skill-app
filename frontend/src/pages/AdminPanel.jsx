import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API_BASE from '../config/api';

const TABS = ['Overview', 'Users', 'Skills', 'Roadmaps'];

export default function AdminPanel() {
  const { dark }  = useTheme();
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const headers   = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [tab,      setTab]      = useState('Overview');
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [skills,   setSkills]   = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [skillForm, setSkillForm]   = useState({ name: '', category: '', trend: '' });
  const [editingSkill, setEditingSkill] = useState(null);
  const [broadcast, setBroadcast] = useState({ title: '', message: '', link: '' });
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);

  useEffect(() => {
    setLoading(true);
    const endpoints = {
      Overview: '/api/admin/stats',
      Users:    '/api/admin/users',
      Skills:   '/api/admin/skills',
      Roadmaps: '/api/admin/roadmaps',
    };
    fetch(`${API_BASE}${endpoints[tab]}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (tab === 'Overview') setStats(data);
        if (tab === 'Users')    setUsers(data);
        if (tab === 'Skills')   setSkills(data);
        if (tab === 'Roadmaps') setRoadmaps(data);
        setLoading(false);
      });
  }, [tab]);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE', headers });
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const toggleAdmin = async (id) => {
    const res  = await fetch(`${API_BASE}/api/admin/users/${id}/toggle-admin`, { method: 'PATCH', headers });
    const data = await res.json();
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isAdmin: data.isAdmin } : u));
  };

  const saveSkill = async () => {
    const url    = editingSkill ? `/api/admin/skills/${editingSkill}` : '/api/admin/skills';
    const method = editingSkill ? 'PUT' : 'POST';
    const res    = await fetch(`${API_BASE}${url}`, { method, headers, body: JSON.stringify(skillForm) });
    const saved  = await res.json();
    if (editingSkill) {
      setSkills((prev) => prev.map((s) => s._id === editingSkill ? saved : s));
    } else {
      setSkills((prev) => [saved, ...prev]);
    }
    setSkillForm({ name: '', category: '', trend: '' });
    setEditingSkill(null);
  };

  const deleteSkill = async (id) => {
    await fetch(`${API_BASE}/api/admin/skills/${id}`, { method: 'DELETE', headers });
    setSkills((prev) => prev.filter((s) => s._id !== id));
  };

  const deleteRoadmap = async (id) => {
    await fetch(`${API_BASE}/api/admin/roadmaps/${id}`, { method: 'DELETE', headers });
    setRoadmaps((prev) => prev.filter((r) => r._id !== id));
  };

  const sendBroadcast = async () => {
    if (!broadcast.title || !broadcast.message) return;
    setSending(true);
    await fetch(`${API_BASE}/api/notifications/broadcast`, {
      method: 'POST', headers, body: JSON.stringify(broadcast),
    });
    setSending(false); setSent(true);
    setBroadcast({ title: '', message: '', link: '' });
    setTimeout(() => setSent(false), 3000);
  };

  const base = `min-h-screen transition-colors duration-300 ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;
  const card = `rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;
  const inp  = `w-full border p-2 rounded-xl text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`;
  const textColor = dark ? '#9CA3AF' : '#374151';
  const gridColor = dark ? '#374151' : '#E5E7EB';

  return (
    <div className={base}>
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🛠️ Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full control over your app</p>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">
            ← Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition
                ${tab === t
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : `border ${dark ? 'border-gray-700 bg-gray-800' : 'bg-white border-gray-200'}`}`}>
              {t}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400 text-center py-20">Loading...</p>}

        {/* OVERVIEW */}
        {!loading && tab === 'Overview' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Users',     value: stats.totalUsers,     icon: '👥' },
                { label: 'Total Skills',    value: stats.totalSkills,    icon: '📚' },
                { label: 'Favorites',       value: stats.totalFavorites, icon: '🔖' },
                { label: 'Roadmaps',        value: stats.totalRoadmaps,  icon: '🗺️' },
                { label: 'New This Week',   value: stats.newUsers,       icon: '🆕' },
              ].map((c, i) => (
                <div key={i} className={card}>
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
                  <div className="text-2xl font-bold">{c.value}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className={card}>
                <h3 className="font-semibold mb-4">🔥 Top Saved Skills</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.topSkills.map((s) => ({ name: s._id, count: s.count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: textColor }} />
                    <YAxis tick={{ fill: textColor }} />
                    <Tooltip contentStyle={{ background: dark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Bar dataKey="count" fill={dark ? '#6B7280' : '#000'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={card}>
                <h3 className="font-semibold mb-4">📈 Signups Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.signupTrend.map((s) => ({ date: s._id, users: s.count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} />
                    <YAxis tick={{ fill: textColor }} />
                    <Tooltip contentStyle={{ background: dark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Bar dataKey="users" fill={dark ? '#9CA3AF' : '#374151'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={card}>
              <h3 className="font-semibold mb-4">📢 Broadcast Announcement</h3>
              {sent && <p className="text-green-500 text-sm mb-3">✅ Sent to all users!</p>}
              <div className="space-y-3">
                <input className={inp} placeholder="Title" value={broadcast.title}
                  onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })} />
                <textarea className={`${inp} h-20 resize-none`} placeholder="Message..."
                  value={broadcast.message}
                  onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })} />
                <input className={inp} placeholder="Link (optional)" value={broadcast.link}
                  onChange={(e) => setBroadcast({ ...broadcast, link: e.target.value })} />
                <button onClick={sendBroadcast} disabled={sending}
                  className="bg-black dark:bg-white dark:text-black text-white px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
                  {sending ? 'Sending...' : '📢 Broadcast to All Users'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading && tab === 'Users' && (
          <div className={card}>
            <h3 className="font-semibold mb-4">👥 All Users ({users.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Joined</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                      <td className="py-3 pr-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium
                          ${u.isAdmin ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          {u.isAdmin ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => toggleAdmin(u._id)}
                            className={`px-3 py-1 rounded-lg text-xs border ${dark ? 'border-gray-600' : 'border-gray-200'}`}>
                            {u.isAdmin ? 'Revoke' : 'Make Admin'}
                          </button>
                          <button onClick={() => deleteUser(u._id)}
                            className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SKILLS */}
        {!loading && tab === 'Skills' && (
          <div className="space-y-6">
            <div className={card}>
              <h3 className="font-semibold mb-4">{editingSkill ? '✏️ Edit Skill' : '➕ Add Skill'}</h3>
              <div className="grid md:grid-cols-3 gap-3 mb-3">
                <input className={inp} placeholder="Skill name" value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} />
                <select className={inp} value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}>
                  <option value="">Category</option>
                  {['Technical', 'Design', 'Business', 'Data', 'Soft Skills'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input className={inp} placeholder="Trend % (e.g. 85%)" value={skillForm.trend}
                  onChange={(e) => setSkillForm({ ...skillForm, trend: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button onClick={saveSkill}
                  className="bg-black dark:bg-white dark:text-black text-white px-5 py-2 rounded-xl text-sm">
                  {editingSkill ? 'Update' : 'Add Skill'}
                </button>
                {editingSkill && (
                  <button onClick={() => { setEditingSkill(null); setSkillForm({ name: '', category: '', trend: '' }); }}
                    className={`px-5 py-2 rounded-xl text-sm border ${dark ? 'border-gray-600' : 'border-gray-200'}`}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
            <div className={card}>
              <h3 className="font-semibold mb-4">📚 All Skills ({skills.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4">Trend</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s._id} className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3 pr-4 font-medium">{s.name}</td>
                        <td className="py-3 pr-4">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{s.category}</span>
                        </td>
                        <td className="py-3 pr-4 text-green-600 dark:text-green-400 font-medium">{s.trend}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingSkill(s._id); setSkillForm({ name: s.name, category: s.category, trend: s.trend }); }}
                              className={`px-3 py-1 rounded-lg text-xs border ${dark ? 'border-gray-600' : 'border-gray-200'}`}>
                              Edit
                            </button>
                            <button onClick={() => deleteSkill(s._id)}
                              className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ROADMAPS */}
        {!loading && tab === 'Roadmaps' && (
          <div className={card}>
            <h3 className="font-semibold mb-4">🗺️ All Roadmaps ({roadmaps.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="pb-3 pr-4">Skill</th>
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Progress</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmaps.map((r) => {
                    const completed = r.nodes.filter((n) => n.completed).length;
                    const total     = r.nodes.length;
                    const pct       = total ? Math.round((completed / total) * 100) : 0;
                    return (
                      <tr key={r._id} className={`border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3 pr-4 font-medium">{r.skillName}</td>
                        <td className="py-3 pr-4 text-gray-500">
                          {r.userId?.name}<br />
                          <span className="text-xs">{r.userId?.email}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-black dark:bg-white h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <button onClick={() => deleteRoadmap(r._id)}
                            className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}