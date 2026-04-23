import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = 2; // Hardcoded for demo

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white h-16 w-full sticky top-0 z-40 border-b border-slate-200 shadow-sm flex items-center justify-between px-6 space-x-4">
      {/* Left - Search bar */}
      <div className="flex-1 max-w-md relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-full cursor-pointer flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Settings button */}
        <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* User Avatar with Dropdown */}
        <div className="relative ml-4">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-8 w-8 rounded-full bg-primary-container border border-slate-300 flex items-center justify-center text-on-primary-container font-bold text-sm cursor-pointer hover:opacity-90"
          >
            {getInitials(user?.name || (isAdmin ? 'Admin' : 'Tenant'))}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
              {!isAdmin && (
                <button 
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  My Profile
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
