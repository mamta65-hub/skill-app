import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import Recommendations from '../components/Recommendations';
import GlobalSearch from '../components/GlobalSearch';
import TrendBarChart from '../components/charts/TrendBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import ProgressLineChart from '../components/charts/ProgressLineChart';
import SkillRadarChart from '../components/charts/SkillRadarChart';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data, loading, error } = useAnalytics();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name} 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your learning analytics</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <NotificationBell />
          <ThemeToggle />
          <button onClick={logout} className="bg-black dark:bg-red-700 text-white px-4 py-2 rounded-xl text-sm">Logout</button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <GlobalSearch />
        <button onClick={() => navigate('/challenges')} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">🎯 Challenges</button>
        <button onClick={() => navigate('/resume')} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">📄 Resume</button>
        <button onClick={() => navigate('/profile')} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">👤 Profile</button>
        <button onClick={() => navigate('/roadmap')} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">🗺️ Roadmaps</button>
        <button onClick={() => navigate('/leaderboard')} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">🏆 Leaderboard</button>
        {user?.isAdmin && (
          <button onClick={() => navigate('/admin')} className="bg-gray-700 dark:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm">🛠️ Admin</button>
        )}
      </div>

      {loading && <div className="text-center py-20 text-gray-400">Loading analytics...</div>}
      {error   && <div className="text-center py-20 text-red-400">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Skills Saved',       value: data.stats.totalSaved,        icon: '🔖' },
              { label: 'Skills Learned',     value: data.stats.totalLearned,      icon: '🎓' },
              { label: 'Roadmaps Completed', value: data.stats.roadmapsCompleted, icon: '🗺️' },
              { label: 'Top Category',       value: data.stats.topCategory,       icon: '🏆' },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 border border-gray-100 dark:border-gray-700">
                <span className="text-2xl">{card.icon}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <TrendBarChart    data={data.trendData    || []} />
            <CategoryPieChart data={data.categoryData || []} />
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ProgressLineChart data={data.progressData || []} />
            <SkillRadarChart   data={data.radarData    || []} />
          </div>
          <Recommendations />
        </>
      )}
    </div>
  );
}