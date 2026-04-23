import { useState, useEffect } from 'react';
import { FiBell, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin, isTenant, token } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && isTenant) {
      const fetchUnread = async () => {
        try {
          const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:4005');
          const res = await axios.get(`${API_URL}/api/notifications/count/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadCount(res.data.count || 0);
        } catch (e) {}
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [user, isTenant, token]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 md:hidden"
        >
          <FiMenu size={20} />
        </button>
        <h2 className="text-xl font-bold text-blue-600 hidden sm:block">SmartPG</h2>
      </div>

      <div className="flex items-center space-x-4">
        <Link to="/notifications" className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors relative">
          <FiBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
            </span>
          )}
        </Link>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {user?.role || 'tenant'}
                </span>
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {initials}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              
              {isTenant && (
                <Link 
                  to="/profile" 
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  onClick={() => setShowDropdown(false)}
                >
                  <FiUser className="mr-2" /> My Profile
                </Link>
              )}
              
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center border-t border-gray-100"
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
