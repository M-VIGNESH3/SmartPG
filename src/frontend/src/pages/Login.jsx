import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-600">
            SmartPG
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Premium PG Management System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">🔐</span> Demo Credentials
          </h3>
          <div className="space-y-3 text-sm text-blue-900">
            <div className="flex flex-col sm:flex-row sm:justify-between p-2 bg-white rounded border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => { setEmail('admin@smartpg.com'); setPassword('Admin@123'); }}>
              <span className="font-semibold w-16">Admin:</span>
              <span className="font-mono">admin@smartpg.com / Admin@123</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between p-2 bg-white rounded border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => { setEmail('rahul@smartpg.com'); setPassword('Tenant@123'); }}>
              <span className="font-semibold w-16">Tenant:</span>
              <span className="font-mono">rahul@smartpg.com / Tenant@123</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-blue-600 italic text-center">Click a row to auto-fill credentials</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
