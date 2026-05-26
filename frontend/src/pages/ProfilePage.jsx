import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';

export default function ProfilePage() {
  const { dark }    = useTheme();
  const { user }    = useAuth();
  const { userId }  = useParams();
  const navigate    = useNavigate();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState(false);

  const targetId = userId || user?.id;

  useEffect(() => {
    fetch(`${API_BASE}/api/profile/${targetId}`)
      .then((r) => r.json())
      .then((data) => { setProfile(data); setLoading(false); });
  }, [targetId]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${targetId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const base = `min-h-screen p-6 transition-colors duration-300 ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;
  const card = `rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;

  if (loading) return <div className={`${base} flex items-center justify-center`}><p className="text-gray-400">Loading profile...</p></div>;
  if (!profile) return <div className={`${base} flex items-center justify-center`}><p className="text-gray-400">Profile not found</p></div>;

  const isOwn = user?.id === targetId;

  return (
    <div className={base}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">
            ← Back
          </button>
          <button onClick={copyLink}
            className={`px-4 py-2 rounded-xl text-sm border transition ${dark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
            {copied ? '✅ Copied!' : '🔗 Share Profile'}
          </button>
        </div>

        {/* Profile Card */}
        <div className={`${card} mb-6`}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl font-black flex-shrink-0">
              {profile.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.user.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Joined {new Date(profile.user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">{profile.user.level?.title?.split(' ')[0]}</span>
                <span className="font-semibold text-sm">{profile.user.level?.title}</span>
                <span className="text-xs text-gray-400">• {profile.user.xp} XP</span>
              </div>
            </div>
            {isOwn && (
              <button onClick={() => navigate('/resume')}
                className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl text-sm">
                📄 Upload Resume
              </button>
            )}
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-black dark:bg-white h-2 rounded-full" style={{ width: `${Math.min(100, (profile.user.xp % 500) / 5)}%` }} />
            </div>
          </div>

          {/* Interests */}
          {profile.user.interests?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Interests:</p>
              <div className="flex flex-wrap gap-2">
                {profile.user.interests.map((i) => (
                  <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Skills',      value: profile.stats.skillsSaved,          icon: '🔖' },
            { label: 'Roadmaps',    value: profile.stats.roadmapsCompleted,     icon: '🗺️' },
            { label: 'Challenges',  value: profile.stats.challengesCompleted,   icon: '🎯' },
            { label: 'Badges',      value: profile.stats.badgesEarned,          icon: '🏅' },
            { label: 'Total XP',    value: profile.user.xp,                     icon: '⭐' },
          ].map((s, i) => (
            <div key={i} className={`${card} text-center`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className={`${card} mb-6`}>
            <h3 className="font-bold mb-4">🏅 Badges Earned ({profile.badges.length})</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((b, i) => (
                <div key={i} className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-xl text-xs font-medium text-center">
                  <div className="text-lg mb-1">{b.badge.split(' ')[0]}</div>
                  <div>{b.badge}</div>
                  <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">{b.skill}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Skills */}
        {profile.topSkills?.length > 0 && (
          <div className={`${card} mb-6`}>
            <h3 className="font-bold mb-4">🔖 Saved Skills</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {profile.topSkills.map((s, i) => (
                <div key={i} className={`p-3 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.category}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">{s.trend} demand</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmaps */}
        {profile.roadmaps?.length > 0 && (
          <div className={card}>
            <h3 className="font-bold mb-4">🗺️ Learning Roadmaps</h3>
            <div className="space-y-3">
              {profile.roadmaps.map((r, i) => {
                const completed = r.nodes.filter((n) => n.completed).length;
                const total     = r.nodes.length;
                const pct       = total ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={i} className={`p-3 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-sm">{r.skillName}</p>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div className="bg-black dark:bg-white h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}