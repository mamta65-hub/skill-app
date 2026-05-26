import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';

const ALL_INTERESTS = [
  'technical', 'web', 'frontend', 'backend', 'ai',
  'data', 'design', 'creative', 'business', 'marketing',
  'management', 'devops', 'softskills', 'database'
];

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, interests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {!isLogin && (
          <input className="w-full border p-3 rounded-xl mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        )}
        <input className="w-full border p-3 rounded-xl mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full border p-3 rounded-xl mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {!isLogin && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2 dark:text-white">Select Your Interests:</p>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((item) => (
                <span key={item} onClick={() => toggleInterest(item)}
                  className={`cursor-pointer px-3 py-1 rounded-full text-sm border transition
                    ${interests.includes(item) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300'}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        <button disabled={loading}
          className="w-full bg-black text-white p-3 rounded-xl disabled:opacity-50">
          {loading ? 'Please wait...' : 'Submit'}
        </button>
        <p className="mt-4 text-center cursor-pointer text-sm text-gray-500"
          onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'No account? Sign up' : 'Have an account? Log in'}
        </p>
      </form>
    </div>
  );
}