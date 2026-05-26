import { useEffect, useState, useCallback } from 'react';
import API_BASE from '../config/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [open,          setOpen]          = useState(false);
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/notifications`, { headers });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PATCH', headers });
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch(`${API_BASE}/api/notifications/read-all`, { method: 'PATCH', headers });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id) => {
    await fetch(`${API_BASE}/api/notifications/${id}`, { method: 'DELETE', headers });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return { notifications, unreadCount, open, setOpen, markRead, markAllRead, deleteNotif };
}