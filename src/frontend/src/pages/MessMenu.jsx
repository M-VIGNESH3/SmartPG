import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RoleGuard from '../components/common/RoleGuard';
import { toast } from 'react-toastify';

const MessMenu = () => {
  const { user, token, isAdmin } = useAuth();
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayOrders, setTodayOrders] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [messRate, setMessRate] = useState(50);
  const [editingDay, setEditingDay] = useState(null);
  
  const [formData, setFormData] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    isVeg: true
  });

  const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_MESS_SERVICE_URL || 'http://localhost:4003');
  const headers = { Authorization: `Bearer ${token}` };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchData();
  }, [isAdmin, token]);

  const fetchData = async () => {
    try {
      const [menuRes, rateRes] = await Promise.all([
        axios.get(`${API_URL}/api/menu/weekly`, { headers }),
        axios.get(`${API_URL}/api/mess/rate`, { headers })
      ]);
      
      setWeeklyMenu(menuRes.data);
      setMessRate(rateRes.data?.ratePerMeal || 50);

      if (isAdmin) {
        const statsRes = await axios.get(`${API_URL}/api/orders/today/stats`, { headers });
        setTodayOrders(statsRes.data);
      }
    } catch (error) {
      toast.error('Failed to load mess data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (dayName) => {
    const existing = weeklyMenu.find(m => m.dayOfWeek === dayName);
    if (existing) {
      setFormData({ breakfast: existing.breakfast, lunch: existing.lunch, dinner: existing.dinner, isVeg: existing.isVeg });
      setEditingDay({ ...existing, isNew: false });
    } else {
      setFormData({ breakfast: '', lunch: '', dinner: '', isVeg: true });
      setEditingDay({ dayOfWeek: dayName, isNew: true });
    }
  };

  const handleSaveMenu = async () => {
    try {
      if (editingDay.isNew) {
        await axios.post(`${API_URL}/api/menu`, { ...formData, dayOfWeek: editingDay.dayOfWeek }, { headers });
      } else {
        await axios.put(`${API_URL}/api/menu/${editingDay._id}`, formData, { headers });
      }
      toast.success('Menu saved successfully');
      setEditingDay(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save menu');
    }
  };

  const updateRate = async () => {
    const newRate = prompt('Enter new mess rate per meal:', messRate);
    if (newRate && !isNaN(newRate)) {
      try {
        await axios.put(`${API_URL}/api/mess/rate`, { ratePerMeal: Number(newRate) }, { headers });
        toast.success('Mess rate updated');
        setMessRate(Number(newRate));
      } catch (e) {
        toast.error('Failed to update rate');
      }
    }
  };

  const optIn = async (mealType) => {
    try {
      await axios.post(`${API_URL}/api/orders/opt-in`, { tenantId: user.id, date: new Date(), mealType, cost: messRate }, { headers });
      toast.success(`Opted in for ${mealType}`);
    } catch (e) {
      toast.error('Failed to opt in');
    }
  };

  const optOut = async (mealType) => {
    try {
      await axios.post(`${API_URL}/api/orders/opt-out`, { tenantId: user.id, date: new Date(), mealType }, { headers });
      toast.success(`Opted out of ${mealType}`);
    } catch (e) {
      toast.error('Failed to opt out');
    }
  };

  if (loading) return <LoadingSpinner />;

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Mess Menu</h1>
        <RoleGuard allowedRoles={['admin']}>
          <button onClick={updateRate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Set Rate (₹{messRate}/meal)
          </button>
        </RoleGuard>
      </div>

      <RoleGuard allowedRoles={['admin']}>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex space-x-6">
          <div>
            <p className="text-sm text-gray-500 font-medium">Today's Opt-ins</p>
          </div>
          <div className="flex space-x-4 font-bold text-gray-900">
            <span className="text-orange-500">Breakfast: {todayOrders.breakfast}</span>
            <span className="text-blue-500">Lunch: {todayOrders.lunch}</span>
            <span className="text-purple-500">Dinner: {todayOrders.dinner}</span>
          </div>
        </div>
      </RoleGuard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {daysOfWeek.map(day => {
          const menu = weeklyMenu.find(m => m.dayOfWeek === day);
          const isToday = day === currentDayName;

          return (
            <div key={day} className={`bg-white rounded-lg shadow-sm border ${isToday ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'} overflow-hidden flex flex-col`}>
              <div className={`px-4 py-3 border-b border-gray-100 flex justify-between items-center ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <h3 className={`font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>{day} {isToday && '(Today)'}</h3>
                {menu && <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${menu.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{menu.isVeg ? 'VEG' : 'NON-VEG'}</span>}
              </div>
              
              <div className="p-4 space-y-4 flex-1">
                {menu ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Breakfast</p>
                      <p className="text-sm text-gray-900">{menu.breakfast}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lunch</p>
                      <p className="text-sm text-gray-900">{menu.lunch}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dinner</p>
                      <p className="text-sm text-gray-900">{menu.dinner}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-8">Menu not set</p>
                )}
              </div>

              <RoleGuard allowedRoles={['admin']}>
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <button 
                    onClick={() => handleEditClick(day)}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit Menu
                  </button>
                </div>
              </RoleGuard>

              {!isAdmin && isToday && (
                <div className="p-3 bg-blue-50 border-t border-blue-100 grid grid-cols-3 gap-2">
                  <button onClick={() => optIn('breakfast')} className="text-xs bg-white border border-blue-300 text-blue-700 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors">B'fast</button>
                  <button onClick={() => optIn('lunch')} className="text-xs bg-white border border-blue-300 text-blue-700 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors">Lunch</button>
                  <button onClick={() => optIn('dinner')} className="text-xs bg-white border border-blue-300 text-blue-700 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors">Dinner</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingDay && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Menu for {editingDay.dayOfWeek}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breakfast Items</label>
                <input type="text" value={formData.breakfast} onChange={e => setFormData({...formData, breakfast: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Poha, Tea, Toast" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lunch Items</label>
                <input type="text" value={formData.lunch} onChange={e => setFormData({...formData, lunch: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Rice, Dal, Roti, Sabzi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dinner Items</label>
                <input type="text" value={formData.dinner} onChange={e => setFormData({...formData, dinner: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Chapati, Paneer, Salad" />
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <input type="checkbox" id="isVeg" checked={formData.isVeg} onChange={e => setFormData({...formData, isVeg: e.target.checked})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="isVeg" className="text-sm text-gray-700">Pure Vegetarian Menu</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setEditingDay(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveMenu} className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700">Save Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessMenu;
