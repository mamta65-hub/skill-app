import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border transition
        border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-800 dark:text-gray-100
        hover:shadow-md text-sm font-medium">
      {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}