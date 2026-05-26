import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import API_BASE from '../config/api';

export default function GlobalSearch() {
  const { dark }    = useTheme();
  const navigate    = useNavigate();
  const [query,     setQuery]   = useState('');
  const [results,   setResults] = useState(null);
  const [loading,   setLoading] = useState(false);
  const [open,      setOpen]    = useState(false);
  const ref = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res  = await fetch(`${API_BASE}/api/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(data);
      setLoading(false);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results && (
    results.skills?.length > 0 || results.challenges?.length > 0 ||
    results.roadmaps?.length > 0 || results.users?.length > 0
  );

  return (
    <div className="relative flex-1 max-w-md" ref={ref}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition
        ${dark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
        <span style={{ fontSize: 14 }}>🔍</span>
        <input
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="Search skills, roadmaps, challenges..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
        />
        {loading && <span className="text-xs text-gray-400">...</span>}
      </div>

      {open && hasResults && (
        <div className={`absolute top-12 left-0 right-0 rounded-2xl shadow-2xl z-50 overflow-hidden
          ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>

          {results.skills?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-b dark:border-gray-700">
                Skills
              </div>
              {results.skills.map((s) => (
                <div key={s._id} onClick={() => { navigate('/dashboard'); setOpen(false); setQuery(''); }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                    ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <span style={{ fontSize: 16 }}>📚</span>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.category} • {s.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.challenges?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-b dark:border-gray-700">
                Challenges
              </div>
              {results.challenges.map((c) => (
                <div key={c._id} onClick={() => { navigate('/challenges'); setOpen(false); setQuery(''); }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                    ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <span style={{ fontSize: 16 }}>🎯</span>
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.skill} • {c.difficulty}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.roadmaps?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-b dark:border-gray-700">
                Your Roadmaps
              </div>
              {results.roadmaps.map((r) => (
                <div key={r._id} onClick={() => { navigate('/roadmap'); setOpen(false); setQuery(''); }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                    ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <span style={{ fontSize: 16 }}>🗺️</span>
                  <p className="text-sm font-medium">{r.skillName}</p>
                </div>
              ))}
            </div>
          )}

          {results.users?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-b dark:border-gray-700">
                Users
              </div>
              {results.users.map((u) => (
                <div key={u._id} onClick={() => { navigate(`/profile/${u._id}`); setOpen(false); setQuery(''); }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                    ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="w-7 h-7 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-bold flex-shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium">{u.name}</p>
                </div>
              ))}
            </div>
          )}

          {!hasResults && query.length >= 2 && !loading && (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}