import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import SearchFilterBar from '../components/common/SearchFilterBar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import FormInput from '../components/common/FormInput';
import { tenantService } from '../services/tenantService';

const Tenants = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', emergencyContact: '', idProofType: 'Aadhar', roomId: '' });
  const perPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [t, r] = await Promise.all([
        tenantService.getTenants().catch(() => []),
        tenantService.getRooms().catch(() => []),
      ]);
      setTenants(Array.isArray(t) ? t : []);
      setRooms(Array.isArray(r) ? r : []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    return (t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.phone?.includes(q) || t.roomNumber?.toString().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'T';
  const availableRooms = rooms.filter(r => r.isAvailable);

  const handleAdd = async () => {
    try {
      await tenantService.register({ ...form, role: 'tenant' });
      setShowAddModal(false);
      setForm({ name: '', email: '', phone: '', password: '', emergencyContact: '', idProofType: 'Aadhar', roomId: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const columns = [
    {
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-h3">
            {getInitials(row.name)}
          </div>
          <div>
            <div className="font-label-md text-on-surface">{row.name}</div>
            <div className="text-[13px] text-on-surface-variant">{row.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Room', accessor: 'roomNumber', render: (row) => <span>{row.roomNumber || 'N/A'}</span> },
    { header: 'Phone', accessor: 'phone', render: (row) => <span>{row.phone || 'N/A'}</span> },
    { header: 'Join Date', render: (row) => <span>{row.joinDate ? new Date(row.joinDate).toLocaleDateString() : 'N/A'}</span> },
    { header: 'Status', render: (row) => <Badge status={row.status || 'active'} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-container"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-h1 font-h1 text-on-background">Tenants</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage all current and past residents</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-secondary-container hover:bg-secondary text-on-primary font-label-md px-4 py-2.5 rounded shadow-sm transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add New Tenant
        </button>
      </div>

      {/* Search and Filter */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by name, room, or phone..."
        filters={[
          { label: 'Filter', icon: 'filter_list', onClick: () => {} },
        ]}
        onExport={() => {}}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={paged}
        actions={(row) => (
          <>
            <button onClick={() => { setSelectedTenant(row); setShowViewModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
            </button>
            {row.status !== 'inactive' && (
              <button onClick={() => { setSelectedTenant(row); setForm({ name: row.name, email: row.email, phone: row.phone || '', password: '', emergencyContact: row.emergencyContact || '', idProofType: row.idProofType || 'Aadhar', roomId: row.roomId || '' }); setShowEditModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            )}
            <button onClick={() => { setSelectedTenant(row); setShowDeleteModal(true); }} className="p-1.5 rounded text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </>
        )}
        pagination={{
          currentPage,
          totalPages,
          total: filtered.length,
          start: (currentPage - 1) * perPage + 1,
          end: Math.min(currentPage * perPage, filtered.length),
          onPageChange: setCurrentPage,
        }}
      />

      {/* Add Tenant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Tenant"
        footer={
          <>
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low transition-colors">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md transition-colors">Add Tenant</button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Enter full name" />
          <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Enter email" />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Enter phone number" />
          <FormInput label="Password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Set a password" />
          <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({...form, emergencyContact: e.target.value})} placeholder="Emergency contact" />
          <div>
            <label className="font-label-md text-on-surface mb-1 block">ID Proof Type</label>
            <select value={form.idProofType} onChange={(e) => setForm({...form, idProofType: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Aadhar</option>
              <option>PAN</option>
              <option>Passport</option>
            </select>
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1 block">Assign Room</label>
            <select value={form.roomId} onChange={(e) => setForm({...form, roomId: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select a room</option>
              {availableRooms.map(r => (
                <option key={r._id} value={r._id}>Room {r.roomNumber} (Floor {r.floor})</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Tenant"
        footer={
          <>
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low transition-colors">Cancel</button>
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-secondary-container hover:bg-secondary text-on-primary rounded font-label-md transition-colors">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          <FormInput label="Email" type="email" value={form.email} readOnly />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({...form, emergencyContact: e.target.value})} />
        </div>
      </Modal>

      {/* View Tenant Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Tenant Details"
      >
        {selectedTenant && (
          <div>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-h1 font-h1 mb-3">
                {getInitials(selectedTenant.name)}
              </div>
              <h3 className="font-h3 text-on-background">{selectedTenant.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge status="active" label="Tenant" />
                <Badge status={selectedTenant.status || 'active'} />
              </div>
            </div>
            <div className="border-t border-outline-variant pt-4 space-y-3">
              <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">Personal Info</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[12px] text-on-surface-variant">Email</p><p className="font-label-md">{selectedTenant.email}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">Phone</p><p className="font-label-md">{selectedTenant.phone || 'N/A'}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">Room</p><p className="font-label-md">{selectedTenant.roomNumber || 'N/A'}</p></div>
                <div><p className="text-[12px] text-on-surface-variant">Joined</p><p className="font-label-md">{selectedTenant.joinDate ? new Date(selectedTenant.joinDate).toLocaleDateString() : 'N/A'}</p></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => { setShowDeleteModal(false); }}
        title="Delete Tenant"
        message={`Are you sure you want to remove ${selectedTenant?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Tenants;
