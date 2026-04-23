import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import { FiHome, FiDollarSign, FiCoffee, FiMessageSquare } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const TENANT_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');
        const PAYMENT_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:4002');
        const MESS_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_MESS_SERVICE_URL || 'http://localhost:4003');
        const COMPLAINT_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_COMPLAINT_SERVICE_URL || 'http://localhost:4004');
        const NOTIFICATION_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:4005');

        const [profileRes, paymentsRes, menuRes, complaintsRes, notifRes] = await Promise.all([
          axios.get(`${TENANT_URL}/api/tenants/${user.id}`, { headers }),
          axios.get(`${PAYMENT_URL}/api/payments/tenant/${user.id}`, { headers }),
          axios.get(`${MESS_URL}/api/menu/today`, { headers }).catch(() => ({ data: null })),
          axios.get(`${COMPLAINT_URL}/api/complaints/tenant/${user.id}`, { headers }),
          axios.get(`${NOTIFICATION_URL}/api/notifications/${user.id}`, { headers })
        ]);

        const payments = paymentsRes.data || [];
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear().toString();
        const currentPayment = payments.find(p => p.month === currentMonth && p.year === currentYear);
        
        const complaints = complaintsRes.data || [];
        const openComplaints = complaints.filter(c => c.status !== 'Closed' && c.status !== 'Resolved').length;

        setData({
          profile: profileRes.data,
          payments,
          currentPayment,
          menu: menuRes.data,
          complaints,
          openComplaints,
          notifications: notifRes.data || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [user.id, token]);

  const handleOptIn = async (mealType) => {
    try {
      const MESS_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_MESS_SERVICE_URL || 'http://localhost:4003');
      const rateRes = await axios.get(`${MESS_URL}/api/mess/rate`, { headers: { Authorization: `Bearer ${token}` } });
      const cost = rateRes.data?.ratePerMeal || 50;

      await axios.post(`${MESS_URL}/api/orders/opt-in`, {
        tenantId: user.id,
        date: new Date().toISOString(),
        mealType,
        cost
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Opted in for ${mealType}`);
    } catch (e) {
      toast.error('Failed to opt in');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name.split(' ')[0]}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FiHome} 
          title="My Room" 
          value={data?.profile?.roomId?.roomNumber || 'Not Assigned'} 
          subtitle={data?.profile?.roomId ? `Floor ${data.profile.roomId.floor} · ${data.profile.roomId.type}` : 'Please contact admin'}
          color="blue"
        />
        <StatCard 
          icon={FiDollarSign} 
          title="Payment Status" 
          value={data?.currentPayment ? data.currentPayment.status : 'No Bill'} 
          subtitle={`For ${new Date().toLocaleString('default', { month: 'long' })}`}
          color={data?.currentPayment?.status === 'completed' ? 'green' : data?.currentPayment?.status === 'pending' ? 'yellow' : 'red'}
        />
        <StatCard 
          icon={FiCoffee} 
          title="Today's Menu" 
          value={data?.menu?.isVeg ? 'Veg' : 'Non-Veg'} 
          subtitle={data?.menu ? `${data.menu.breakfast.split(',')[0]}...` : 'Not Set'}
          color="purple"
        />
        <StatCard 
          icon={FiMessageSquare} 
          title="My Complaints" 
          value={data?.openComplaints || 0} 
          subtitle="Open Complaints"
          color={data?.openComplaints > 0 ? 'yellow' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment History */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Payments</h2>
            <Link to="/payments" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.payments.slice(0, 3).map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{payment.month} {payment.year}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹{payment.amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data?.payments.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500">No payment records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Meal Opt-in */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><FiCoffee className="mr-2 text-blue-500"/> Today's Meals</h2>
          {data?.menu ? (
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <p className="font-semibold text-sm">Breakfast</p>
                  <p className="text-xs text-gray-500 truncate w-32">{data.menu.breakfast}</p>
                </div>
                <button onClick={() => handleOptIn('breakfast')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Opt In</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <p className="font-semibold text-sm">Lunch</p>
                  <p className="text-xs text-gray-500 truncate w-32">{data.menu.lunch}</p>
                </div>
                <button onClick={() => handleOptIn('lunch')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Opt In</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <p className="font-semibold text-sm">Dinner</p>
                  <p className="text-xs text-gray-500 truncate w-32">{data.menu.dinner}</p>
                </div>
                <button onClick={() => handleOptIn('dinner')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Opt In</button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Menu not set for today</div>
          )}
          <Link to="/mess" className="mt-4 text-center text-sm text-blue-600 hover:underline">View Weekly Menu</Link>
        </div>
      </div>

      {/* Quick Actions & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Notifications</h2>
            <Link to="/notifications" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {data?.notifications.slice(0, 3).map((notif) => (
              <div key={notif._id} className={`p-3 rounded border ${!notif.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50 border-y-blue-50 border-r-blue-50' : 'border-gray-100 bg-white'}`}>
                <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{notif.message}</p>
              </div>
            ))}
            {data?.notifications.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">No recent notifications</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/complaints" className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <span className="block text-sm font-medium text-gray-900">Raise Complaint</span>
            </Link>
            <Link to="/mess" className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <span className="block text-sm font-medium text-gray-900">View Mess Bill</span>
            </Link>
            <Link to="/profile" className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-300 transition-colors col-span-2">
              <span className="block text-sm font-medium text-gray-900">My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
