import { useState, useEffect } from 'react';
import { Users, Home, AlertCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tenantService } from '../services/tenantService';
import { paymentService } from '../services/paymentService';
import { complaintService } from '../services/complaintService';
import StatCard from '../components/StatCard';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTenants: 0,
    availableRooms: 0,
    pendingPayments: 0,
    openComplaints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user.role === 'admin') {
          const [tenantStats, paymentSummary, complaints] = await Promise.all([
            tenantService.getStats().catch(() => ({ totalTenants: 0, availableRooms: 0 })),
            paymentService.getSummary().catch(() => ({ pendingAmount: 0 })),
            complaintService.getAllComplaints().catch(() => [])
          ]);

          const openComplaintsCount = complaints.filter(c => c.status === 'Open').length;

          setStats({
            totalTenants: tenantStats.totalTenants || 0,
            availableRooms: tenantStats.availableRooms || 0,
            pendingPayments: paymentSummary.pendingAmount || 0,
            openComplaints: openComplaintsCount
          });
        } else {
          // Tenant specific stats
          const [payments, complaints] = await Promise.all([
            paymentService.getPaymentsByTenant(user._id).catch(() => []),
            complaintService.getComplaintsByTenant(user._id).catch(() => [])
          ]);

          const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
          const openComplaintsCount = complaints.filter(c => c.status === 'Open').length;

          setStats({
            pendingPayments: pendingAmount,
            openComplaints: openComplaintsCount
          });
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {user.role === 'admin' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Tenants" 
            value={stats.totalTenants} 
            icon={Users} 
            colorClass="bg-blue-500" 
          />
          <StatCard 
            title="Rooms Available" 
            value={stats.availableRooms} 
            icon={Home} 
            colorClass="bg-green-500" 
          />
          <StatCard 
            title="Pending Dues ($)" 
            value={stats.pendingPayments} 
            icon={DollarSign} 
            colorClass="bg-yellow-500" 
          />
          <StatCard 
            title="Open Complaints" 
            value={stats.openComplaints} 
            icon={AlertCircle} 
            colorClass="bg-red-500" 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard 
            title="Your Pending Dues ($)" 
            value={stats.pendingPayments} 
            icon={DollarSign} 
            colorClass="bg-yellow-500" 
          />
          <StatCard 
            title="Your Open Complaints" 
            value={stats.openComplaints} 
            icon={AlertCircle} 
            colorClass="bg-red-500" 
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome back, {user.name}!</h2>
        <p className="text-gray-600">
          This is your SmartPG dashboard. Use the sidebar to navigate through the different sections of the application.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
