import { useEffect, useState } from 'react';
import API_BASE from '../config/api';

export default function Recommendations() {
  const [recs,    setRecs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setRecs(data.recommendations || []); setLoading(false); });
  }, []);

  if (loading) return <p className="text-gray-400">Loading recommendations...</p>;
  if (!recs.length) return <p className="text-gray-400">No recommendations found!</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🤖 Recommended For You</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {recs.map((skill, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 border-l-4 border-black dark:border-white">
            <h3 className="text-lg font-semibold">{skill.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{skill.category}</p>
            <p className="text-sm mt-1">📈 Demand: {skill.trend}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {skill.tags?.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}