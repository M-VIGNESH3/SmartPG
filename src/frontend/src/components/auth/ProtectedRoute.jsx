import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
