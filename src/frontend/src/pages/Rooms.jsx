import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiHome, FiCheckCircle, FiTool, FiUsers } from 'react-icons/fi';

const Rooms = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    type: 'single',
    rent: '',
    amenities: [],
    status: 'Available'
  });
  const [editingId, setEditingId] = useState(null);

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:4001');
  const headers = { Authorization: `Bearer ${token}` };

  const allAmenities = ['WiFi', 'AC', 'Geyser', 'Laundry', 'Parking', 'TV', 'Balcony'];

  useEffect(() => {
    fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rooms`, { headers });
      setRooms(res.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        floor: room.floor,
        type: room.type,
        rent: room.rent,
        amenities: room.amenities || [],
        status: room.status
      });
      setEditingId(room._id);
      setIsEditing(true);
    } else {
      setFormData({ roomNumber: '', floor: '', type: 'single', rent: '', amenities: [], status: 'Available' });
      setEditingId(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const isSelected = prev.amenities.includes(amenity);
      if (isSelected) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/api/rooms/${editingId}`, formData, { headers });
        toast.success('Room updated successfully');
      } else {
        await axios.post(`${API_URL}/api/rooms`, formData, { headers });
        toast.success('Room created successfully');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const getCapacity = (type) => {
    if (type === 'single') return 1;
    if (type === 'double') return 2;
    if (type === 'triple') return 3;
    return 1;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all PG rooms, beds, and amenities</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          + Add New Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map(room => {
          const maxCapacity = getCapacity(room.type);
          const currentOccupants = room.occupants ? room.occupants.length : 0;
          
          let statusColor = "bg-green-100 text-green-800";
          let StatusIcon = FiCheckCircle;
          
          if (room.status === 'Occupied' || currentOccupants >= maxCapacity) {
            statusColor = "bg-red-100 text-red-800";
            StatusIcon = FiUsers;
          } else if (room.status === 'Maintenance') {
            statusColor = "bg-yellow-100 text-yellow-800";
            StatusIcon = FiTool;
          }

          return (
            <div key={room._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${statusColor}`}>
                    <FiHome size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{room.roomNumber}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Floor {room.floor}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${statusColor}`}>
                  <StatusIcon size={12} />
                  <span>{room.status}</span>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{room.type}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rent</p>
                    <p className="font-semibold text-blue-600">₹{room.rent}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 uppercase tracking-wider">Occupancy</span>
                    <span className="font-bold text-gray-900">{currentOccupants}/{maxCapacity} Beds</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${currentOccupants === maxCapacity ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(currentOccupants / maxCapacity) * 100}%` }}></div>
                  </div>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {room.amenities.map(a => (
                        <span key={a} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <button onClick={() => handleOpenModal(room)} className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Edit Room Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Room' : 'Add New Room'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input required type="text" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 text-sm" placeholder="e.g., 101" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input required type="text" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 text-sm" placeholder="e.g., 1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 text-sm">
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
                  <input required type="number" value={formData.rent} onChange={e => setFormData({...formData, rent: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 text-sm" placeholder="₹" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 text-sm">
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {allAmenities.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        formData.amenities.includes(amenity) 
                          ? 'bg-blue-100 border-blue-300 text-blue-800' 
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm">{isEditing ? 'Save Changes' : 'Create Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
