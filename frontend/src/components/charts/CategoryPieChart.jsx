import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS_LIGHT = ['#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'];
const COLORS_DARK  = ['#F9FAFB', '#E5E7EB', '#9CA3AF', '#6B7280', '#4B5563'];

export default function CategoryPieChart({ data }) {
  const { dark } = useTheme();
  const COLORS = dark ? COLORS_DARK : COLORS_LIGHT;
  return (
    <div className={`rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
      <h3 className="font-semibold mb-4">📂 Skills by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: dark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}