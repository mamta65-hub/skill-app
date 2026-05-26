import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function SkillRadarChart({ data }) {
  const { dark } = useTheme();
  return (
    <div className={`rounded-2xl shadow p-5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
      <h3 className="font-semibold mb-4">🕸️ Skill Coverage Radar</h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke={dark ? '#374151' : '#E5E7EB'} />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: dark ? '#9CA3AF' : '#374151' }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: dark ? '#6B7280' : '#9CA3AF' }} />
          <Radar name="Saved" dataKey="saved" stroke={dark ? '#F9FAFB' : '#000'} fill={dark ? '#F9FAFB' : '#000'} fillOpacity={0.3} />
          <Tooltip contentStyle={{ background: dark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}