import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../context/ThemeContext';

const TYPE_ICON = {
  recommendation:     '🤖',
  roadmap_progress:   '🗺️',
  admin_announcement: '📢',
};

export default function NotificationBell() {
  const { dark }    = useTheme();
  const navigate    = useNavigate();
  const ref         = useRef(null);
  const { notifications, unreadCount, open, setOpen, markRead, markAllRead, deleteNotif } = useNotifications();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (notif) => {
    markRead(notif._id);
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-xl border transition
          ${dark ? 'bg-gray-800 border-gray-600 hover:border-gray-400' : 'bg-white border-gray-200 hover:shadow-md'}`}>
        <span style={{ fontSize: 20 }}>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden
          ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          <div className={`flex justify-between items-center px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-black dark:hover:text-white">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">🎉 You're all caught up!</div>
            ) : (
              notifications.map((n) => (
                <div key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex gap-3 px-4 py-3 border-b cursor-pointer transition
                    ${dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-50 hover:bg-gray-50'}
                    ${!n.read ? (dark ? 'bg-gray-750' : 'bg-blue-50') : ''}`}>
                  <div style={{ fontSize: 20 }} className="shrink-0 mt-0.5">{TYPE_ICON[n.type] || '🔔'}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.read ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-300 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                    <button onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                      className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}