import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const TABS = [
  { key: 'combinedScore',     label: '🏆 Combined'  },
  { key: 'skillsSaved',       label: '🔖 Skills'    },
  { key: 'roadmapsCompleted', label: '🗺️ Roadmaps'  },
];

const MEDALS  = { 1: '🥇', 2: '🥈', 3: '🥉' };
const SCORE_KEY = {
  combinedScore:     'combinedScore',
  skillsSaved:       'skillsSaved',
  roadmapsCompleted: 'roadmapsCompleted',
};

export default function LeaderboardPage() {
  const { dark }  = useTheme();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');

  const [tab,     setTab]     = useState('combinedScore');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/leaderboard?tab=${tab}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [tab]);

  const base = `min-h-screen p-6 transition-colors duration-300 ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;
  const card = `rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;
  const textColor  = dark ? '#9CA3AF' : '#374151';
  const gridColor  = dark ? '#374151' : '#E5E7EB';

  return (
    <div className={base}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
            {data && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Week of {data.weekStart} – {data.weekEnd}
              </p>
            )}
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">
            ← Dashboard
          </button>
        </div>

        {/* My rank banner */}
        {data && (
          <div className={`${card} mb-6 flex items-center justify-between`}>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your Rank</p>
              <p className="text-4xl font-black">
                {MEDALS[data.myRank] || `#${data.myRank}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Your Score</p>
              <p className="text-2xl font-bold">
                {data.scores.find((s) => s.isCurrentUser)?.[SCORE_KEY[tab]] ?? 0}
                {tab === 'combinedScore' && <span className="text-sm font-normal text-gray-400 ml-1">pts</span>}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition
                ${tab === t.key
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : `border ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading leaderboard...</div>
        ) : (
          <>
            {/* Bar chart */}
            {data?.scores.length > 0 && (
              <div className={`${card} mb-6`}>
                <h3 className="font-semibold mb-4 text-sm">Top Players</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.scores.slice(0, 5).map((s) => ({ name: s.name, score: s[SCORE_KEY[tab]] }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} />
                    <YAxis tick={{ fill: textColor }} />
                    <Tooltip contentStyle={{ background: dark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Bar dataKey="score" fill={dark ? '#6B7280' : '#000'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Rankings */}
            <div className={card}>
              {/* Podium top 3 */}
              {data?.scores.length >= 3 && (
                <div className="flex justify-center items-end gap-6 mb-8 pt-4">
                  {[1, 0, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`rounded-full flex items-center justify-center font-black mb-2
                        ${i === 0 ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-2xl'}
                        ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {MEDALS[i + 1]}
                      </div>
                      <p className={`font-semibold text-center truncate ${i === 0 ? 'text-sm w-24' : 'text-xs w-20'}`}>
                        {data.scores[i]?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {data.scores[i]?.[SCORE_KEY[tab]]}
                        {tab === 'combinedScore' ? 'pts' : ''}
                      </p>
                      <div className={`w-16 rounded-t-lg mt-2 ${dark ? 'bg-gray-600' : 'bg-gray-200'}`}
                        style={{ height: i === 0 ? 80 : i === 1 ? 55 : 40 }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Full list */}
              <div className="space-y-2">
                {data?.scores.map((s) => (
                  <div key={s.rank}
                    className={`flex items-center gap-4 p-3 rounded-xl transition
                      ${s.isCurrentUser
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : `hover:bg-gray-50 dark:hover:bg-gray-700`}`}>
                    <div className="w-8 text-center font-bold text-sm shrink-0">
                      {MEDALS[s.rank] || `#${s.rank}`}
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                      ${s.isCurrentUser
                        ? 'bg-white text-black dark:bg-black dark:text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {s.name}
                        {s.isCurrentUser && <span className="ml-2 text-xs opacity-60">(you)</span>}
                      </p>
                    </div>
                    <div className="hidden md:flex gap-4 text-xs opacity-60 shrink-0">
                      <span>🔖 {s.skillsSaved}</span>
                      <span>🗺️ {s.roadmapsCompleted}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">
                        {s[SCORE_KEY[tab]]}
                        {tab === 'combinedScore' && <span className="text-xs font-normal opacity-60 ml-1">pts</span>}
                      </p>
                    </div>
                  </div>
                ))}
                {data?.scores.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    No scores yet this week. Be the first! 🚀
                  </p>
                )}
              </div>
            </div>

            {/* Scoring guide */}
            <div className={`${card} mt-6`}>
              <h3 className="font-semibold mb-3 text-sm">📊 How Points Are Calculated</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: '🔖', label: 'Skill Saved',      pts: '+10 pts' },
                  { icon: '🗺️', label: 'Roadmap Completed', pts: '+50 pts' },
                  { icon: '📈', label: 'Avg Progress',      pts: '+1 pt each' },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                    <div className="text-sm font-bold mt-1">{item.pts}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                🔄 Resets every Monday at midnight
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}