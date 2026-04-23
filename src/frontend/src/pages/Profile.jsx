import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiHome } from 'react-icons/fi';

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', emergencyContact: '', address: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tenants/${user.id}`, { headers });
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          emergencyContact: res.data.emergencyContact || '',
          address: res.data.address || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id, token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/api/tenants/${user.id}`, formData, { headers });
      setProfile(res.data);
      updateUser({ name: res.data.name });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    try {
      await axios.put(`${API_URL}/api/tenants/${user.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, { headers });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-center p-6">
            <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
              {profile?.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{profile?.email}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
              Active Tenant
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center"><FiHome className="mr-2 text-blue-500"/> Room Details</h3>
            </div>
            <div className="p-6">
              {profile?.roomId ? (
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500 text-sm">Room Number</span>
                    <span className="font-semibold text-gray-900">{profile.roomId.roomNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500 text-sm">Floor</span>
                    <span className="font-semibold text-gray-900">{profile.roomId.floor}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500 text-sm">Type</span>
                    <span className="font-semibold text-gray-900 capitalize">{profile.roomId.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Monthly Rent</span>
                    <span className="font-semibold text-blue-600">₹{profile.roomId.rent}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm italic">Not assigned to any room yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center"><FiUser className="mr-2 text-blue-500"/> Personal Information</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      disabled={!isEditing} 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className={`w-full p-2.5 rounded-lg border text-sm ${isEditing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="flex items-center w-full p-2.5 rounded-lg border border-transparent bg-gray-50 text-sm text-gray-500">
                      <FiMail className="mr-2 text-gray-400" /> {profile?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className={isEditing ? 'text-gray-400' : 'text-gray-400'} />
                      </div>
                      <input 
                        type="text" 
                        disabled={!isEditing} 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className={`w-full pl-10 p-2.5 rounded-lg border text-sm ${isEditing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    <input 
                      type="text" 
                      disabled={!isEditing} 
                      value={formData.emergencyContact} 
                      onChange={e => setFormData({...formData, emergencyContact: e.target.value})} 
                      className={`w-full p-2.5 rounded-lg border text-sm ${isEditing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`} 
                      placeholder="Name & Number"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                    <textarea 
                      rows="2" 
                      disabled={!isEditing} 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      className={`w-full p-2.5 rounded-lg border text-sm ${isEditing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`} 
                    ></textarea>
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center"><FiLock className="mr-2 text-blue-500"/> Change Password</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.currentPassword} 
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm" 
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
