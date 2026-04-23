import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:4005');

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const notificationService = {
  getNotifications: async (tenantId) => {
    const response = await axios.get(`${API_URL}/api/notifications/${tenantId}`, { headers: getAuthHeader() });
    return response.data;
  },

  getUnreadCount: async (tenantId) => {
    const response = await axios.get(`${API_URL}/api/notifications/count/${tenantId}`, { headers: getAuthHeader() });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, { headers: getAuthHeader() });
    return response.data;
  },

  markAllAsRead: async (tenantId) => {
    const response = await axios.put(`${API_URL}/api/notifications/read-all/${tenantId}`, {}, { headers: getAuthHeader() });
    return response.data;
  }
};
