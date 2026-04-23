import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Utensils, 
  MessageSquare, 
  LogOut,
  Users,
  Building,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setSidebarOpen }) => {
  const { logout, isAdmin, isTenant } = useAuth();

  const adminNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', href: '/tenants', icon: Users },
    { name: 'Rooms', href: '/rooms', icon: Building },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Mess Menu', href: '/mess', icon: Utensils },
    { name: 'Complaints', href: '/complaints', icon: MessageSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const tenantNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Payments', href: '/payments', icon: CreditCard },
    { name: 'Mess Menu', href: '/mess', icon: Utensils },
    { name: 'My Complaints', href: '/complaints', icon: MessageSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  const navigation = isAdmin ? adminNav : (isTenant ? tenantNav : []);

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 transition-opacity md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar component */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 bg-gray-900 border-b border-gray-800">
          <span className="text-2xl font-bold tracking-wider text-blue-500">SmartPG</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              closeSidebar();
              logout();
            }}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:animate-pulse" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
