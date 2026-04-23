import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import SearchFilterBar from '../components/common/SearchFilterBar';
import Badge from '../components/common/Badge';
import StatCard from '../components/StatCard';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import ConfirmModal from '../components/common/ConfirmModal';
import { paymentService } from '../services/paymentService';
import { tenantService } from '../services/tenantService';

const Payments = () => {
  const { user, isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ tenantId: '', month: '', year: new Date().getFullYear(), amount: '', dueDate: '', paymentMethod: 'Cash', notes: '' });
  const perPage = 10;

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      let payData;
      if (isAdmin) {
        payData = await paymentService.getAllPayments().catch(() => []);
        const t = await tenantService.getTenants().catch(() => []);
        setTenants(Array.isArray(t) ? t : []);
      } else {
        payData = await paymentService.getPaymentsByTenant(user?.id).catch(() => []);
      }
      setPayments(Array.isArray(payData) ? payData : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = payments.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      const tenantName = p.tenantName || tenants.find(t => t._id === p.tenantId)?.name || '';
      if (!tenantName.toLowerCase().includes(q)) return false;
    }
    if (filterMonth !== 'all' && p.month?.toString() !== filterMonth) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const paidTotal = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingTotal = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
  const overdueTotal = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + (p.amount || 0), 0);

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'T';
  const getTenantName = (p) => p.tenantName || tenants.find(t => t._id === p.tenantId)?.name || 'Unknown';

  const handleMarkPaid = async (payment) => {
    try {
      await paymentService.updateStatus(payment._id, 'paid');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleMarkOverdue = async (payment) => {
    try {
      await paymentService.updateStatus(payment._id, 'overdue');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentPayment = !isAdmin ? payments.find(p => {
    const now = new Date();
    return p.month === now.getMonth() + 1 && p.year === now.getFullYear();
  }) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-container"></div>
      </div>
    );
  }

  // ═══ TENANT VIEW ═══
  if (!isAdmin) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h1 font-h1 text-on-background">My Payments</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Your payment history</p>
          </div>
        </div>

        {/* Current Month Card */}
        {currentPayment && (
          <div className="bg-primary-container rounded-lg p-6 mb-6">
            <p className="font-label-md text-on-primary-container/70">Current Month</p>
            <h3 className="font-h3 text-on-primary-container mt-1">{currentMonth}</h3>
            <p className="text-h2 font-h2 text-on-primary-container mt-2">₹{(currentPayment.amount || 0).toLocaleString()}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge status={currentPayment.status} />
              <span className="text-body-md text-on-primary-container/70">
                Due: {currentPayment.dueDate ? new Date(currentPayment.dueDate).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        )}

        {/* Payment History Table */}
        <DataTable
          columns={[
            { header: 'Month', render: (row) => <span>{months[(row.month || 1) - 1]} {row.year}</span> },
            { header: 'Amount', render: (row) => <span>₹{(row.amount || 0).toLocaleString()}</span> },
            { header: 'Due Date', render: (row) => <span>{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-'}</span> },
            { header: 'Paid Date', render: (row) => <span>{row.paidDate ? new Date(row.paidDate).toLocaleDateString() : '-'}</span> },
            { header: 'Status', render: (row) => <Badge status={row.status} /> },
          ]}
          data={paged}
          pagination={{
            currentPage, totalPages, total: filtered.length,
            start: (currentPage - 1) * perPage + 1,
            end: Math.min(currentPage * perPage, filtered.length),
            onPageChange: setCurrentPage,
          }}
        />
      </div>
    );
  }

  // ═══ ADMIN VIEW ═══
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-h1 font-h1 text-on-background">Payments</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Track all rent payments</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap mb-8">
        <StatCard icon="account_balance" iconBg="bg-[#e8f5e9]" value={`₹${paidTotal.toLocaleString()}`} label="Total Collected" />
        <StatCard icon="schedule" iconBg="bg-[#fff8e1]" value={`₹${pendingTotal.toLocaleString()}`} label="Pending" />
        <StatCard icon="warning" iconBg="bg-error-container" value={`₹${overdueTotal.toLocaleString()}`} label="Overdue" />
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by tenant name..."
        filters={[
          {
            type: 'select', value: filterMonth,
            onChange: setFilterMonth,
            options: [{ label: 'All Months', value: 'all' }, ...months.map((m, i) => ({ label: m, value: (i + 1).toString() }))]
          },
          {
            type: 'select', value: filterStatus,
            onChange: setFilterStatus,
            options: [{ label: 'All Status', value: 'all' }, { label: 'Paid', value: 'paid' }, { label: 'Pending', value: 'pending' }, { label: 'Overdue', value: 'overdue' }]
          }
        ]}
      />

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'Tenant',
            render: (row) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-label-md text-sm">
                  {getInitials(getTenantName(row))}
                </div>
                <span className="font-label-md text-on-surface">{getTenantName(row)}</span>
              </div>
            )
          },
          { header: 'Room', render: (row) => <span>{row.roomNumber || 'N/A'}</span> },
          { header: 'Month/Year', render: (row) => <span>{months[(row.month || 1) - 1]} {row.year}</span> },
          { header: 'Amount', render: (row) => <span className="font-label-md">₹{(row.amount || 0).toLocaleString()}</span> },
          { header: 'Due Date', render: (row) => <span>{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-'}</span> },
          { header: 'Paid Date', render: (row) => <span>{row.paidDate ? new Date(row.paidDate).toLocaleDateString() : '-'}</span> },
          { header: 'Status', render: (row) => <Badge status={row.status} /> },
        ]}
        data={paged}
        actions={(row) => (
          <>
            {row.status !== 'paid' && (
              <button onClick={() => handleMarkPaid(row)} className="p-1.5 rounded text-on-surface-variant hover:text-green-600 transition-colors" title="Mark Paid">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </button>
            )}
            {row.status === 'pending' && (
              <button onClick={() => handleMarkOverdue(row)} className="p-1.5 rounded text-on-surface-variant hover:text-[#f57f17] transition-colors" title="Mark Overdue">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </button>
            )}
            <button onClick={() => { setSelectedPayment(row); setShowDeleteModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </>
        )}
        pagination={{
          currentPage, totalPages, total: filtered.length,
          start: (currentPage - 1) * perPage + 1,
          end: Math.min(currentPage * perPage, filtered.length),
          onPageChange: setCurrentPage,
        }}
      />

      {/* Create Payment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Payment"
        footer={
          <>
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low">Cancel</button>
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md">Create</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Select Tenant</label>
            <select value={form.tenantId} onChange={(e) => setForm({...form, tenantId: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
              <option value="">Choose a tenant...</option>
              {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
            </select>
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Month</label>
            <select value={form.month} onChange={(e) => setForm({...form, month: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
              <option value="">Select month</option>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <FormInput label="Year" type="number" value={form.year} onChange={(e) => setForm({...form, year: e.target.value})} />
          <FormInput label="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} placeholder="Auto-fills from room rent" />
          <FormInput label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} />
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Payment Method</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface">
              <option>Cash</option><option>UPI</option><option>Bank Transfer</option>
            </select>
          </div>
          <FormInput label="Notes (optional)" type="textarea" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Add any notes..." rows={3} />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={() => setShowDeleteModal(false)} title="Delete Payment" message="Are you sure you want to delete this payment record?" />
    </div>
  );
};

export default Payments;
