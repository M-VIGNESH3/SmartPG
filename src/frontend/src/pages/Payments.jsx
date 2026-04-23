import { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = user.role === 'admin' 
        ? await paymentService.getAllPayments()
        : await paymentService.getPaymentsByTenant(user._id);
      setPayments(data);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await paymentService.updateStatus(id, status);
      toast.success('Payment status updated');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div>Loading payments...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {user.role === 'admin' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.month} {payment.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${payment.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {payment.status}
                  </span>
                </td>
                {user.role === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {payment.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(payment._id, 'completed')}
                        className="text-primary hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={user.role === 'admin' ? 4 : 3} className="px-6 py-4 text-center text-gray-500">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
