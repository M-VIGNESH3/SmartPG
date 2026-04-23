import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import RoleGuard from '../components/common/RoleGuard';
import EmptyState from '../components/common/EmptyState';
import { FiCreditCard } from 'react-icons/fi';

const Payments = () => {
  const { user, token, isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:4002');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPayments();
  }, [user, isAdmin, token]);

  const fetchPayments = async () => {
    try {
      if (isAdmin) {
        const [payRes, sumRes] = await Promise.all([
          axios.get(`${API_URL}/api/payments`, { headers }),
          axios.get(`${API_URL}/api/payments/summary`, { headers })
        ]);
        setPayments(payRes.data);
        setSummary(sumRes.data);
      } else {
        const res = await axios.get(`${API_URL}/api/payments/tenant/${user.id}`, { headers });
        setPayments(res.data);
      }
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/payments/${id}/status`, { status }, { headers });
      toast.success(`Payment marked as ${status}`);
      fetchPayments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deletePayment = async (id) => {
    if(!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await axios.delete(`${API_URL}/api/payments/${id}`, { headers });
      toast.success('Payment deleted');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'All Payments' : 'My Payments'}</h1>
        <RoleGuard allowedRoles={['admin']}>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Create Payment
          </button>
        </RoleGuard>
      </div>

      <RoleGuard allowedRoles={['admin']}>
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <p className="text-sm font-medium text-green-600 mb-1">Total Collected</p>
              <h3 className="text-2xl font-bold text-green-900">₹{summary.collectedAmount}</h3>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
              <p className="text-sm font-medium text-yellow-600 mb-1">Total Pending</p>
              <h3 className="text-2xl font-bold text-yellow-900">₹{summary.pendingAmount}</h3>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <p className="text-sm font-medium text-red-600 mb-1">Total Overdue</p>
              <h3 className="text-2xl font-bold text-red-900">₹{summary.overdueAmount}</h3>
            </div>
          </div>
        )}
      </RoleGuard>

      {payments.length === 0 ? (
        <EmptyState 
          icon={FiCreditCard} 
          title="No payments found" 
          description={isAdmin ? "There are no payment records in the system." : "You have no payment history."} 
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <RoleGuard allowedRoles={['admin']}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant ID</th>
                  </RoleGuard>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                  <RoleGuard allowedRoles={['admin']}>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </RoleGuard>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <RoleGuard allowedRoles={['admin']}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.tenantId.substring(0, 8)}...
                      </td>
                    </RoleGuard>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.month} {payment.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                    </td>
                    <RoleGuard allowedRoles={['admin']}>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {payment.status !== 'completed' && (
                          <button onClick={() => updateStatus(payment._id, 'completed')} className="text-green-600 hover:text-green-900 mr-3">Mark Paid</button>
                        )}
                        {payment.status === 'pending' && (
                          <button onClick={() => updateStatus(payment._id, 'overdue')} className="text-yellow-600 hover:text-yellow-900 mr-3">Overdue</button>
                        )}
                        <button onClick={() => deletePayment(payment._id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </RoleGuard>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
