import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-outline-variant">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-primary-container text-[28px]">apartment</span>
          </div>
          <h1 className="text-h2 font-h2 text-on-background">SmartPG</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Paying Guest Management System</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="font-label-md text-on-surface mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="font-label-md text-on-surface mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3 py-2 pr-10 border border-outline-variant rounded-md font-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary-container hover:bg-secondary text-on-primary font-label-md py-3 rounded-md transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[16px] text-secondary-container">key</span>
            <span className="font-label-md text-on-surface">Demo Credentials</span>
          </div>

          <div className="py-2 border-b border-outline-variant flex justify-between items-center cursor-pointer hover:bg-surface-container rounded px-2 -mx-2 transition-colors" onClick={() => fillDemo('admin@smartpg.com', 'Admin@123')}>
            <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[11px] font-label-sm">Admin</span>
            <div className="text-right">
              <p className="font-label-sm text-on-surface">admin@smartpg.com</p>
              <p className="text-[11px] text-on-surface-variant">Admin@123</p>
            </div>
          </div>

          <div className="py-2 flex justify-between items-center cursor-pointer hover:bg-surface-container rounded px-2 -mx-2 transition-colors mt-1" onClick={() => fillDemo('rahul@smartpg.com', 'Tenant@123')}>
            <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[11px] font-label-sm">Tenant</span>
            <div className="text-right">
              <p className="font-label-sm text-on-surface">rahul@smartpg.com</p>
              <p className="text-[11px] text-on-surface-variant">Tenant@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
