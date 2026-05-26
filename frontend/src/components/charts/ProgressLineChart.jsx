import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function ProgressLineChart({ data }) {
  const { dark } = useTheme();
  const textColor = dark ? '#9CA3AF' : '#374151';
  const gridColor = dark ? '#374151' : '#E5E7EB';
  return (
    <div className={`rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
      <h3 className="font-semibold mb-4">📅 Learning Progress Over Time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} />
          <YAxis tick={{ fill: textColor }} />
          <Tooltip contentStyle={{ background: dark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }} />
          <Legend />
          <Line type="monotone" dataKey="learned"  stroke={dark ? '#F9FAFB' : '#000'} strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="roadmaps" stroke={dark ? '#9CA3AF' : '#6B7280'} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}