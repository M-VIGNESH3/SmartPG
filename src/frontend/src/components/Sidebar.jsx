import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Utensils, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Mess Menu', href: '/mess', icon: Utensils },
    { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-primary text-white h-full">
      <div className="flex items-center justify-center h-16 border-b border-blue-800">
        <span className="text-2xl font-bold tracking-wider">SmartPG</span>
      </div>
      <div className="flex-1 px-4 space-y-2 mt-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-accent text-white' : 'text-blue-100 hover:bg-blue-800'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
      <div className="p-4 border-t border-blue-800">
        <div className="mb-4 px-4 text-sm text-blue-200">
          Logged in as <span className="font-bold text-white capitalize">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-blue-100 hover:bg-blue-800 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
