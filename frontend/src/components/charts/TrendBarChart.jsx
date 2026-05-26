import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function TrendBarChart({ data }) {
  const { dark } = useTheme();
  const textColor = dark ? '#9CA3AF' : '#374151';
  const gridColor = dark ? '#374151' : '#E5E7EB';
  return (
    <div className={`rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
      <h3 className="font-semibold mb-4">📈 Saved Skills Trend Score</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: textColor }} />
          <YAxis domain={[0, 100]} tick={{ fill: textColor }} />
          <Tooltip contentStyle={{ background: dark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }} />
          <Bar dataKey="trend" fill={dark ? '#6B7280' : '#000'} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}