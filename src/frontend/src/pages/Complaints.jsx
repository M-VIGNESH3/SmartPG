import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RoleGuard from '../components/common/RoleGuard';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';
import { FiMessageSquare } from 'react-icons/fi';

const Complaints = () => {
  const { user, token, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Maintenance', priority: 'Medium' });

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_COMPLAINT_SERVICE_URL || 'http://localhost:4004');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchComplaints();
  }, [user, isAdmin, token]);

  const fetchComplaints = async () => {
    try {
      if (isAdmin) {
        const [compRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/api/complaints`, { headers }),
          axios.get(`${API_URL}/api/complaints/stats`, { headers })
        ]);
        setComplaints(compRes.data);
        setStats(statsRes.data);
      } else {
        const res = await axios.get(`${API_URL}/api/complaints/tenant/${user.id}`, { headers });
        setComplaints(res.data);
      }
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/complaints`, formData, { headers });
      toast.success('Complaint raised successfully');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'Maintenance', priority: 'Medium' });
      fetchComplaints();
    } catch (e) {
      toast.error('Failed to raise complaint');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/complaints/${id}/status`, { status }, { headers });
      toast.success('Status updated');
      fetchComplaints();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await axios.delete(`${API_URL}/api/complaints/${id}`, { headers });
      toast.success('Complaint deleted');
      fetchComplaints();
    } catch (e) {
      toast.error('Failed to delete complaint');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Complaints Management' : 'My Complaints'}</h1>
        {!isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + Raise Complaint
          </button>
        )}
      </div>

      <RoleGuard allowedRoles={['admin']}>
        {stats && (
          <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center border-r border-gray-100"><p className="text-xl font-bold text-red-600">{stats.Open}</p><p className="text-xs text-gray-500 font-medium">Open</p></div>
            <div className="text-center border-r border-gray-100"><p className="text-xl font-bold text-yellow-600">{stats['In Progress']}</p><p className="text-xs text-gray-500 font-medium">In Progress</p></div>
            <div className="text-center border-r border-gray-100"><p className="text-xl font-bold text-green-600">{stats.Resolved}</p><p className="text-xs text-gray-500 font-medium">Resolved</p></div>
            <div className="text-center"><p className="text-xl font-bold text-gray-900">{stats.Total}</p><p className="text-xs text-gray-500 font-medium">Total</p></div>
          </div>
        )}
      </RoleGuard>

      {complaints.length === 0 ? (
        <EmptyState icon={FiMessageSquare} title="No complaints" description="There are no complaints to display right now." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map(complaint => (
            <div key={complaint._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded">{complaint.category}</span>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${complaint.priority === 'Urgent' ? 'bg-red-100 text-red-800' : complaint.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {complaint.priority}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{complaint.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{complaint.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full font-semibold ${
                    complaint.status === 'Open' ? 'text-red-700 bg-red-50' :
                    complaint.status === 'In Progress' ? 'text-yellow-700 bg-yellow-50' :
                    'text-green-700 bg-green-50'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center">
                {isAdmin ? (
                  <select 
                    className="text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={complaint.status}
                    onChange={(e) => updateStatus(complaint._id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                ) : (
                  <div className="text-xs font-medium text-gray-500 flex space-x-3">
                    {complaint.status === 'Open' && (
                      <button onClick={() => deleteComplaint(complaint._id)} className="text-red-600 hover:underline">Delete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Raise New Complaint</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500">
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Noise">Noise</option>
                  <option value="Security">Security</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500" placeholder="Brief summary of the issue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500" placeholder="Detailed explanation..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex space-x-4">
                  {['Low', 'Medium', 'High'].map(p => (
                    <label key={p} className="flex items-center text-sm text-gray-700">
                      <input type="radio" name="priority" value={p} checked={formData.priority === p} onChange={e => setFormData({...formData, priority: e.target.value})} className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
