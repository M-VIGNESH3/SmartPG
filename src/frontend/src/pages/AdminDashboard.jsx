import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import { FiUsers, FiHome, FiDollarSign, FiMessageSquare } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTenants, setRecentTenants] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const TENANT_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');
        const PAYMENT_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:4002');
        const COMPLAINT_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_COMPLAINT_SERVICE_URL || 'http://localhost:4004');

        const [tenantsRes, roomsRes, paymentsRes, complaintsStatsRes, complaintsRes] = await Promise.all([
          axios.get(`${TENANT_URL}/api/tenants`, { headers }),
          axios.get(`${TENANT_URL}/api/rooms`, { headers }),
          axios.get(`${PAYMENT_URL}/api/payments/summary`, { headers }),
          axios.get(`${COMPLAINT_URL}/api/complaints/stats`, { headers }),
          axios.get(`${COMPLAINT_URL}/api/complaints`, { headers })
        ]);

        const tenants = tenantsRes.data || [];
        const rooms = roomsRes.data || [];
        
        const activeTenants = tenants.filter(t => t.isActive).length;
        const availableRooms = rooms.filter(r => r.status === 'Available').length;
        const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
        const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;

        setStats({
          tenants: { total: tenants.length, active: activeTenants, inactive: tenants.length - activeTenants },
          rooms: { total: rooms.length, occupied: occupiedRooms, available: availableRooms, maintenance: maintenanceRooms },
          payments: paymentsRes.data || { collectedAmount: 0, pendingAmount: 0, overdueAmount: 0 },
          complaints: complaintsStatsRes.data || { Open: 0, 'In Progress': 0, Resolved: 0, Total: 0 }
        });

        setRecentTenants(tenants.slice(0, 5));
        setRecentComplaints((complaintsRes.data || []).slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/tenants" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Add Tenant
          </Link>
          <Link to="/rooms" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            + Add Room
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FiHome} 
          title="Rooms" 
          value={stats?.rooms.total || 0} 
          subtitle={`${stats?.rooms.available || 0} Available · ${stats?.rooms.occupied || 0} Occupied`}
          color="blue"
        />
        <StatCard 
          icon={FiUsers} 
          title="Tenants" 
          value={stats?.tenants.total || 0} 
          subtitle={`${stats?.tenants.active || 0} Active · ${stats?.tenants.inactive || 0} Inactive`}
          color="green"
        />
        <StatCard 
          icon={FiDollarSign} 
          title="Payments Collected" 
          value={`₹${stats?.payments.collectedAmount || 0}`} 
          subtitle={`Pending: ₹${stats?.payments.pendingAmount || 0} · Overdue: ₹${stats?.payments.overdueAmount || 0}`}
          color="purple"
        />
        <StatCard 
          icon={FiMessageSquare} 
          title="Open Complaints" 
          value={stats?.complaints.Open || 0} 
          subtitle={`In Progress: ${stats?.complaints['In Progress'] || 0} · Resolved: ${stats?.complaints.Resolved || 0}`}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Tenants</h2>
            <Link to="/tenants" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {tenant.roomId?.roomNumber || 'Not Assigned'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentTenants.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500">No tenants found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Complaints</h2>
            <Link to="/complaints" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <div key={complaint._id} className="flex justify-between items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{complaint.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{complaint.category}</p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  complaint.status === 'Open' ? 'bg-red-100 text-red-800' : 
                  complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {complaint.status}
                </span>
              </div>
            ))}
            {recentComplaints.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">No recent complaints</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/payments" className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <FiDollarSign className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Collect Payment</span>
          </Link>
          <Link to="/mess" className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <FiUsers className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Update Menu</span>
          </Link>
          <Link to="/notifications" className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <FiMessageSquare className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Send Broadcast</span>
          </Link>
          <Link to="/rooms" className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <FiHome className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Manage Rooms</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
