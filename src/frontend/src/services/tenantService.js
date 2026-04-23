import axios from 'axios';

const API_URL = import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const tenantService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  },

  getTenants: async () => {
    const response = await axios.get(`${API_URL}/api/tenants`, { headers: getAuthHeader() });
    return response.data;
  },

  getRooms: async () => {
    const response = await axios.get(`${API_URL}/api/rooms`, { headers: getAuthHeader() });
    return response.data;
  },
  
  getStats: async () => {
    // Helper for dashboard to get tenant count and room availability
    const [tenants, rooms] = await Promise.all([
      axios.get(`${API_URL}/api/tenants`, { headers: getAuthHeader() }),
      axios.get(`${API_URL}/api/rooms`, { headers: getAuthHeader() })
    ]);
    
    const availableRooms = rooms.data.filter(r => r.isAvailable).length;
    
    return {
      totalTenants: tenants.data.length,
      availableRooms
    };
  }
};
