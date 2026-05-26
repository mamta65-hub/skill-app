import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useDropzone } from 'react-dropzone';
import API_BASE from '../config/api';

export default function ResumePage() {
  const { dark }   = useTheme();
  const navigate   = useNavigate();
  const token      = localStorage.getItem('token');
  const headers    = { Authorization: `Bearer ${token}` };

  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [existing,  setExisting]  = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/resume`, { headers })
      .then((r) => r.json())
      .then((data) => { if (data) setExisting(data); });
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res  = await fetch(`${API_BASE}/api/resume/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
      setExisting(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const base = `min-h-screen p-6 transition-colors duration-300 ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;
  const card = `rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;

  const data = result || existing;

  return (
    <div className={base}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📄 Resume Skill Matching</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload your resume to find skill gaps!
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">
            ← Dashboard
          </button>
        </div>

        {/* Upload Zone */}
        <div {...getRootProps()} className={`${card} mb-6 cursor-pointer transition
          border-2 border-dashed text-center py-12
          ${isDragActive
            ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700'
            : 'border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white'}`}>
          <input {...getInputProps()} />
          <div className="text-5xl mb-4">📄</div>
          {loading ? (
            <div>
              <p className="font-semibold text-lg">Analyzing your resume...</p>
              <p className="text-gray-500 text-sm mt-1">Matching skills from your CV</p>
            </div>
          ) : isDragActive ? (
            <p className="font-semibold text-lg">Drop your resume here!</p>
          ) : (
            <div>
              <p className="font-semibold text-lg">
                {data ? 'Upload a new resume' : 'Drop your resume here'}
              </p>
              <p className="text-gray-500 text-sm mt-1">PDF or TXT • Max 5MB</p>
              <button className="mt-4 bg-black dark:bg-white dark:text-black text-white px-6 py-2 rounded-xl text-sm">
                Browse Files
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">

            {/* Score */}
            <div className={card}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {data.fileName || 'Resume Analysis'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Skill match score
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-black ${
                    (data.matchScore || 0) >= 70 ? 'text-green-500'
                    : (data.matchScore || 0) >= 40 ? 'text-yellow-500'
                    : 'text-red-500'}`}>
                    {data.matchScore || 0}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all ${
                  (data.matchScore || 0) >= 70 ? 'bg-green-500'
                  : (data.matchScore || 0) >= 40 ? 'bg-yellow-500'
                  : 'bg-red-500'}`}
                  style={{ width: `${data.matchScore || 0}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <div className={card}>
                <h3 className="font-bold mb-4 text-green-600 dark:text-green-400">
                  ✅ Skills Found ({(data.matchedSkills || []).length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(data.matchedSkills || []).map((skill, i) => (
                    <span key={i} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                  {(data.matchedSkills || []).length === 0 && (
                    <p className="text-gray-400 text-sm">No matching skills found</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className={card}>
                <h3 className="font-bold mb-4 text-red-600 dark:text-red-400">
                  ❌ Skills to Learn ({(data.missingSkills || []).length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(data.missingSkills || []).map((skill, i) => (
                    <span key={i} className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <button onClick={() => navigate('/roadmap')}
                  className="w-full mt-4 bg-black dark:bg-white dark:text-black text-white py-2 rounded-xl text-sm font-medium">
                  🗺️ Generate Roadmaps for Missing Skills
                </button>
              </div>
            </div>

            {/* Recommendations */}
            <div className={card}>
              <h3 className="font-bold mb-3">💡 What to do next?</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { icon: '🗺️', title: 'Build Roadmaps', desc: 'Create learning roadmaps for your missing skills', action: () => navigate('/roadmap') },
                  { icon: '🎯', title: 'Take Challenges', desc: 'Practice with skill challenges to improve your score', action: () => navigate('/challenges') },
                  { icon: '🤖', title: 'Get Recommendations', desc: 'View AI-recommended skills based on your profile', action: () => navigate('/dashboard') },
                ].map((item, i) => (
                  <div key={i} onClick={item.action}
                    className={`p-4 rounded-xl cursor-pointer transition hover:shadow-md ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}