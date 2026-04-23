import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Payments from './pages/Payments';
import MessMenu from './pages/MessMenu';
import Complaints from './pages/Complaints';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Rooms from './pages/Rooms';
import TenantDetail from './pages/TenantDetail';
import Tenants from './pages/Tenants'; // Assuming a Tenants page based on route requirements

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const { isAdmin } = useAuth();

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Routes (Admin or Tenant) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="dashboard" element={isAdmin ? <AdminDashboard /> : <Dashboard />} />
                <Route path="payments" element={<Payments />} />
                <Route path="mess" element={<MessMenu />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />

                {/* Admin Only Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="tenants" element={<Tenants />} />
                  <Route path="tenants/:id" element={<TenantDetail />} />
                  <Route path="rooms" element={<Rooms />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          } />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
