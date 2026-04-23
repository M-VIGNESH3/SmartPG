import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user._id);
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user._id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No notifications found.</div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`p-4 flex justify-between items-start ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}
            >
              <div>
                <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                  {notification.title}
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {notification.type}
                  </span>
                </h4>
                <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="text-xs text-primary hover:text-blue-900 bg-white px-2 py-1 rounded border border-blue-200"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
