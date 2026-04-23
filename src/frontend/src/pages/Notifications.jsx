import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RoleGuard from '../components/common/RoleGuard';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';
import { FiBell, FiTrash2, FiCheck, FiCheckAll } from 'react-icons/fi';

const Notifications = () => {
  const { user, token, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'general', tenantId: 'All Tenants' });
  const [tenants, setTenants] = useState([]);

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:4005');
  const TENANT_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchNotifications();
    if (isAdmin) {
      axios.get(`${TENANT_URL}/api/tenants`, { headers }).then(res => setTenants(res.data)).catch(console.error);
    }
  }, [user, isAdmin, token]);

  const fetchNotifications = async () => {
    try {
      const endpoint = isAdmin ? `${API_URL}/api/notifications/all` : `${API_URL}/api/notifications/${user.id}`;
      const res = await axios.get(endpoint, { headers });
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/notifications/announce`, formData, { headers });
      toast.success('Broadcast sent successfully');
      setIsModalOpen(false);
      setFormData({ title: '', message: '', type: 'general', tenantId: 'All Tenants' });
      fetchNotifications();
    } catch (e) {
      toast.error('Failed to send broadcast');
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, { headers });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/read-all/${user.id}`, {}, { headers });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (e) {
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, { headers });
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (e) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><FiBell size={24} /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">You have {unreadCount} unread message{unreadCount !== 1 && 's'}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {!isAdmin && unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-2 rounded-lg">
              <FiCheckAll className="mr-2" /> Mark all read
            </button>
          )}
          <RoleGuard allowedRoles={['admin']}>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              + Send Broadcast
            </button>
          </RoleGuard>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={FiBell} title="All caught up!" description="You don't have any notifications at the moment." />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {notifications.map(notif => (
              <li key={notif._id} className={`p-4 transition-colors ${!notif.isRead && !isAdmin ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.isRead && !isAdmin ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm ${!notif.isRead && !isAdmin ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-100 px-2 py-0.5 rounded">{notif.type}</span>
                          {isAdmin && !notif.tenantId && <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider bg-purple-100 px-2 py-0.5 rounded">BROADCAST</span>}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className={`text-sm ${!notif.isRead && !isAdmin ? 'text-gray-700' : 'text-gray-500'}`}>{notif.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isAdmin && !notif.isRead && (
                      <button onClick={() => markAsRead(notif._id)} title="Mark as read" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                        <FiCheck size={16} />
                      </button>
                    )}
                    {isAdmin && (
                      <button onClick={() => deleteNotification(notif._id)} title="Delete" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><FiBell className="mr-2 text-blue-600" /> Send Notification</h2>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="All Tenants">All Tenants (Broadcast)</option>
                  {tenants.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.roomId?.roomNumber || 'No Room'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="general">General Update</option>
                  <option value="payment">Payment Alert</option>
                  <option value="complaint">Complaint Status</option>
                  <option value="urgent">Urgent Notice</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g., Water Supply Maintenance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea required rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Type the notification message here..."></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
