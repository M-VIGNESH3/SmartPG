import { useState, useEffect } from 'react';
import { messService } from '../services/messService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MessMenu = () => {
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuData, orderData] = await Promise.all([
        messService.getWeeklyMenu(),
        user.role !== 'admin' ? messService.getOrders(user._id) : Promise.resolve([])
      ]);
      setMenus(menuData);
      setOrders(orderData);
    } catch (error) {
      toast.error('Failed to load mess data');
    } finally {
      setLoading(false);
    }
  };

  const handleOptIn = async (date, mealType) => {
    try {
      await messService.optIn({ tenantId: user._id, date, mealType, cost: 50 }); // Mock cost 50
      toast.success(`Opted in for ${mealType}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to opt in');
    }
  };

  if (loading) return <div>Loading menu...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Weekly Mess Menu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div key={menu._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-primary px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-white">{menu.dayOfWeek}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Breakfast</p>
                <p className="mt-1 text-sm text-gray-900">{menu.breakfast}</p>
                {user.role !== 'admin' && (
                  <button onClick={() => handleOptIn(new Date(), 'breakfast')} className="mt-2 text-xs text-primary font-medium hover:underline">
                    Opt In
                  </button>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lunch</p>
                <p className="mt-1 text-sm text-gray-900">{menu.lunch}</p>
                {user.role !== 'admin' && (
                  <button onClick={() => handleOptIn(new Date(), 'lunch')} className="mt-2 text-xs text-primary font-medium hover:underline">
                    Opt In
                  </button>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dinner</p>
                <p className="mt-1 text-sm text-gray-900">{menu.dinner}</p>
                {user.role !== 'admin' && (
                  <button onClick={() => handleOptIn(new Date(), 'dinner')} className="mt-2 text-xs text-primary font-medium hover:underline">
                    Opt In
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessMenu;
