import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiUsers, FiSearch, FiEye } from 'react-icons/fi';

const Tenants = () => {
  const { token } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', emergencyContact: '', address: '', roomId: ''
  });

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [tenantsRes, roomsRes] = await Promise.all([
        axios.get(`${API_URL}/api/tenants`, { headers }),
        axios.get(`${API_URL}/api/rooms/available`, { headers })
      ]);
      setTenants(tenantsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/tenants`, { ...formData, role: 'tenant' }, { headers });
      toast.success('Tenant created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', emergencyContact: '', address: '', roomId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create tenant');
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.role === 'tenant' && 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered tenants</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
          + Add New Tenant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <FiUsers className="mr-2" />
            <span className="font-semibold">{filteredTenants.length} Tenants</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map(tenant => (
                <tr key={tenant._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{tenant.roomId?.roomNumber || 'None'}</div>
                    {tenant.roomId && <div className="text-xs text-gray-500">{tenant.roomId.type}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/tenants/${tenant._id}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                      <FiEye className="mr-1" /> View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Register New Tenant</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Room (Optional)</label>
                <select value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500">
                  <option value="">Do not assign yet</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>
                      Room {room.roomNumber} ({room.type} - ₹{room.rent})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input required type="text" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea required rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500"></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm">Register Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
