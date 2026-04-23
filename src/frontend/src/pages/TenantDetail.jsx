import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, FiActivity, FiKey } from 'react-icons/fi';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [id, token]);

  const fetchData = async () => {
    try {
      const [tenantRes, roomsRes] = await Promise.all([
        axios.get(`${API_URL}/api/tenants/${id}`, { headers }),
        axios.get(`${API_URL}/api/rooms/available`, { headers })
      ]);
      setTenant(tenantRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      toast.error('Failed to load tenant details');
      navigate('/tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await axios.put(`${API_URL}/api/tenants/${id}/status`, { isActive: status }, { headers });
      setTenant({ ...tenant, isActive: status });
      toast.success(`Tenant marked as ${status ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRoomAllocation = async (roomId) => {
    try {
      await axios.post(`${API_URL}/api/rooms/allocate`, { tenantId: id, roomId }, { headers });
      toast.success('Room allocated successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate room');
    }
  };

  const handleRoomRelease = async () => {
    if (!window.confirm('Are you sure you want to remove this tenant from the room?')) return;
    try {
      await axios.post(`${API_URL}/api/rooms/${tenant.roomId._id}/release`, { tenantId: id }, { headers });
      toast.success('Room released');
      fetchData();
    } catch (error) {
      toast.error('Failed to release room');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be 6+ characters');
    try {
      await axios.put(`${API_URL}/api/tenants/${id}/reset-password`, { newPassword }, { headers });
      toast.success('Password reset successfully');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!tenant) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/tenants')} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
        <FiArrowLeft className="mr-2" /> Back to Tenants
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-center p-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
            {tenant.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
          <p className="text-gray-500 mb-6">{tenant.email}</p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => handleStatusChange(!tenant.isActive)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center w-32 ${tenant.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
            >
              {tenant.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Details & Room Management */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center"><FiUser className="mr-2 text-blue-500"/> Tenant Details</h3>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {tenant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <FiPhone className="mt-1 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{tenant.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiActivity className="mt-1 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Emergency Contact</p>
                  <p className="text-sm font-semibold text-gray-900">{tenant.emergencyContact}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:col-span-2">
                <FiMapPin className="mt-1 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Permanent Address</p>
                  <p className="text-sm font-semibold text-gray-900">{tenant.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center">Room Allocation</h3>
            </div>
            <div className="p-6">
              {tenant.roomId ? (
                <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <div>
                    <h4 className="text-lg font-bold text-blue-900">Room {tenant.roomId.roomNumber}</h4>
                    <p className="text-sm text-blue-700 font-medium">Floor {tenant.roomId.floor} • {tenant.roomId.type} • ₹{tenant.roomId.rent}/month</p>
                  </div>
                  <button onClick={handleRoomRelease} className="text-sm bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 font-medium">
                    Release Room
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-4">This tenant is not currently assigned to any room.</p>
                  <div className="flex items-center space-x-4">
                    <select id="room-select" className="border border-gray-300 rounded-lg p-2.5 text-sm flex-1 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select an available room</option>
                      {rooms.map(room => (
                        <option key={room._id} value={room._id}>Room {room.roomNumber} ({room.type} - ₹{room.rent})</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => {
                        const val = document.getElementById('room-select').value;
                        if(val) handleRoomAllocation(val);
                      }} 
                      className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Assign Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><FiKey className="mr-2 text-blue-600" /> Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">Set a new password for {tenant.name}.</p>
            <form onSubmit={handleResetPassword}>
              <input 
                type="password" 
                required 
                placeholder="New Password"
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full border-gray-300 rounded-lg p-2.5 border mb-4 focus:ring-blue-500" 
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetail;
