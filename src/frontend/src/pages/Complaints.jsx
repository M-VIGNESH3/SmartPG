import { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', category: 'maintenance', priority: 'medium' });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = user.role === 'admin' 
        ? await complaintService.getAllComplaints()
        : await complaintService.getComplaintsByTenant(user._id);
      setComplaints(data);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await complaintService.updateStatus(id, status);
      toast.success('Complaint status updated');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintService.createComplaint({ ...newComplaint, tenantId: user._id });
      toast.success('Complaint raised successfully');
      setShowModal(false);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to raise complaint');
    }
  };

  if (loading) return <div>Loading complaints...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        {user.role !== 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            Raise Complaint
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {user.role === 'admin' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <tr key={complaint._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {complaint.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {complaint.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${complaint.priority === 'high' ? 'bg-red-100 text-red-800' : 
                      complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {complaint.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                      complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {complaint.status}
                  </span>
                </td>
                {user.role === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {complaint.status === 'Open' && (
                      <button onClick={() => handleStatusChange(complaint._id, 'In Progress')} className="text-yellow-600 hover:text-yellow-900">In Progress</button>
                    )}
                    {complaint.status !== 'Resolved' && (
                      <button onClick={() => handleStatusChange(complaint._id, 'Resolved')} className="text-green-600 hover:text-green-900">Resolve</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td colSpan={user.role === 'admin' ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Raise Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={newComplaint.title} onChange={e => setNewComplaint({...newComplaint, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={newComplaint.description} onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={newComplaint.category} onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}>
                  <option value="maintenance">Maintenance</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="noise">Noise</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-900">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
