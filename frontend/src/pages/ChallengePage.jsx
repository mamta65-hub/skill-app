import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';

const DIFFICULTY_COLOR = {
  Beginner:     'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Advanced:     'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ChallengePage() {
  const { dark }   = useTheme();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const token      = localStorage.getItem('token');
  const headers    = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [challenges,  setChallenges]  = useState([]);
  const [userStats,   setUserStats]   = useState(null);
  const [filter,      setFilter]      = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [active,      setActive]      = useState(null);
  const [answers,     setAnswers]     = useState({});
  const [result,      setResult]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/challenges`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/api/challenges/user/stats`, { headers }).then((r) => r.json()),
    ]).then(([c, s]) => { setChallenges(c); setUserStats(s); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? challenges
    : challenges.filter((c) => c.type === filter || c.difficulty === filter);

  const startChallenge = async (challenge) => {
    const res  = await fetch(`${API_BASE}/api/challenges/${challenge._id}`, { headers });
    const data = await res.json();
    setActive(data.challenge);
    setAnswers({});
    setResult(null);
  };

  const submitChallenge = async () => {
    if (!active) return;
    setSubmitting(true);
    const answersArray = active.questions.map((_, i) => ({ answer: answers[i] || '' }));
    const res  = await fetch(`${API_BASE}/api/challenges/${active._id}/submit`, {
      method: 'POST', headers,
      body:   JSON.stringify({ answers: answersArray }),
    });
    const data = await res.json();
    setResult(data);
    setSubmitting(false);

    // Update challenges list
    setChallenges((prev) => prev.map((c) =>
      c._id === active._id ? { ...c, isCompleted: true } : c
    ));

    // Refresh stats
    fetch(`${API_BASE}/api/challenges/user/stats`, { headers })
      .then((r) => r.json()).then(setUserStats);
  };

  const base = `min-h-screen p-6 transition-colors duration-300 ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;
  const card = `rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;
  const inp  = `w-full border p-3 rounded-xl text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`;

  return (
    <div className={base}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">🎯 Challenges & Assignments</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Complete challenges to earn XP and badges!
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">
            ← Dashboard
          </button>
        </div>

        {/* User Stats Bar */}
        {userStats && (
          <div className={`${card} mb-8`}>
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{userStats.level?.title?.split(' ')[0]}</div>
                <div>
                  <p className="font-bold text-lg">{userStats.level?.title}</p>
                  <p className="text-sm text-gray-500">Level {userStats.level?.level}</p>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{userStats.xp} XP</span>
                  <span>{userStats.nextLevel ? `${userStats.xpToNext} XP to Level ${userStats.nextLevel.level}` : 'MAX LEVEL!'}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-black dark:bg-white h-3 rounded-full transition-all"
                    style={{ width: userStats.nextLevel
                      ? `${Math.min(100, ((userStats.xp - userStats.level.minXP) / (userStats.nextLevel.minXP - userStats.level.minXP)) * 100)}%`
                      : '100%' }} />
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{userStats.totalCompleted}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.badges?.length}</p>
                  <p className="text-xs text-gray-500">Badges</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.xp}</p>
                  <p className="text-xs text-gray-500">Total XP</p>
                </div>
              </div>
            </div>

            {/* Badges */}
            {userStats.badges?.length > 0 && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <p className="text-sm font-semibold mb-2">🏅 Your Badges:</p>
                <div className="flex flex-wrap gap-2">
                  {userStats.badges.map((b, i) => (
                    <span key={i} className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-3 py-1 rounded-full font-medium">
                      {b.badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Left — Challenge List */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'daily', 'skill', 'Beginner', 'Intermediate', 'Advanced'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize
                    ${filter === f
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : `border ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}`}>
                  {f === 'all' ? '🌟 All' : f === 'daily' ? '📅 Daily' : f === 'skill' ? '🎯 Skill' : f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading challenges...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((c) => (
                  <div key={c._id} className={`${card} cursor-pointer hover:shadow-lg transition
                    ${c.isCompleted ? 'opacity-75' : ''}`}
                    onClick={() => !c.isCompleted && startChallenge(c)}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium mr-2 ${DIFFICULTY_COLOR[c.difficulty]}`}>
                          {c.difficulty}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium
                          ${c.type === 'daily'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                          {c.type === 'daily' ? '📅 Daily' : '🎯 Skill'}
                        </span>
                      </div>
                      {c.isCompleted && <span className="text-green-500 font-bold text-sm">✅ Done</span>}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{c.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{c.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>📝 {c.questions?.length} questions</span>
                        <span>⭐ {c.totalPoints} XP</span>
                      </div>
                      <span className="text-lg">{c.badge?.split(' ')[0]}</span>
                    </div>
                    {!c.isCompleted && (
                      <button className="w-full mt-3 bg-black dark:bg-white dark:text-black text-white py-2 rounded-xl text-sm font-medium">
                        Start Challenge →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Active Challenge */}
          {active && (
            <div className="w-96 shrink-0">
              <div className={card}>
                {/* Challenge header */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-bold text-lg">{active.title}</h2>
                  <button onClick={() => { setActive(null); setResult(null); }}
                    className="text-gray-400 hover:text-red-500">✕</button>
                </div>

                {/* Result */}
                {result ? (
                  <div className="text-center py-4">
                    <div className="text-5xl mb-3">{result.passed ? '🎉' : '💪'}</div>
                    <h3 className="text-xl font-bold mb-2">
                      {result.passed ? 'Challenge Passed!' : 'Keep Practicing!'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You scored {result.totalPoints} XP out of {active.totalPoints}
                    </p>
                    {result.badge && (
                      <div className="bg-yellow-100 dark:bg-yellow-900 rounded-xl p-3 mb-4">
                        <p className="text-sm font-semibold">🏅 Badge Earned!</p>
                        <p className="text-lg">{result.badge.badge}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4">
                      <p className="text-sm font-semibold mb-2">Question Results:</p>
                      {result.gradedAnswers.map((a, i) => (
                        <div key={i} className="flex justify-between text-xs py-1">
                          <span>Q{i + 1}</span>
                          <span className={a.isCorrect ? 'text-green-500' : 'text-orange-500'}>
                            {a.isCorrect ? '✅' : '⚡'} +{a.pointsEarned} XP
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-blue-500">
                      Total XP: {result.xp?.xp} | Level: {result.xp?.level?.title}
                    </p>
                    <button onClick={() => { setActive(null); setResult(null); }}
                      className="w-full mt-4 bg-black dark:bg-white dark:text-black text-white py-2 rounded-xl text-sm">
                      Back to Challenges
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Questions */}
                    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                      {active.questions.map((q, i) => (
                        <div key={i} className={`p-4 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${q.type === 'mcq' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : q.type === 'coding' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                              {q.type === 'mcq' ? '🔵 MCQ' : q.type === 'coding' ? '💻 Coding' : '✍️ Theory'}
                            </span>
                            <span className="text-xs text-gray-500">+{q.points} XP</span>
                          </div>
                          <p className="text-sm font-medium mb-3">Q{i + 1}. {q.question}</p>

                          {/* MCQ */}
                          {q.type === 'mcq' && (
                            <div className="space-y-2">
                              {q.options.map((opt, j) => (
                                <label key={j} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition
                                  ${answers[i] === opt
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : `${dark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}`}>
                                  <input type="radio" name={`q${i}`}
                                    checked={answers[i] === opt}
                                    onChange={() => setAnswers({ ...answers, [i]: opt })}
                                    className="sr-only" />
                                  <span className="text-xs">{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Theory */}
                          {q.type === 'theory' && (
                            <textarea
                              className={`${inp} h-24 resize-none`}
                              placeholder="Write your answer here..."
                              value={answers[i] || ''}
                              onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                            />
                          )}

                          {/* Coding */}
                          {q.type === 'coding' && (
                            <div>
                              {q.starterCode && (
                                <pre className={`text-xs p-3 rounded-lg mb-2 overflow-x-auto ${dark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                  {q.starterCode}
                                </pre>
                              )}
                              <textarea
                                className={`${inp} h-32 resize-none font-mono text-xs`}
                                placeholder="Write your code here..."
                                value={answers[i] || ''}
                                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                              />
                              {q.expectedOutput && (
                                <p className="text-xs text-gray-400 mt-1">Expected: {q.expectedOutput}</p>
                              )}
                              {q.hints?.length > 0 && (
                                <details className="mt-2">
                                  <summary className="text-xs text-blue-500 cursor-pointer">💡 Hints</summary>
                                  <ul className="text-xs text-gray-500 mt-1 pl-4 list-disc">
                                    {q.hints.map((h, k) => <li key={k}>{h}</li>)}
                                  </ul>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button onClick={submitChallenge} disabled={submitting}
                      className="w-full mt-4 bg-black dark:bg-white dark:text-black text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                      {submitting ? 'Submitting...' : '🚀 Submit Challenge'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}