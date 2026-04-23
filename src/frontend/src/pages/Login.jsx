import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError({ type: 'validation', message: 'Please enter email and password' });
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const response = err.response?.data;
      if (response?.code) {
        setError({ type: response.code, message: response.message, reason: response.reason });
      } else {
        setError({ type: 'error', message: response?.message || 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  // Determine error style based on type
  const getErrorStyle = () => {
    if (!error) return null;
    if (error.type === 'ACCOUNT_PENDING') {
      return {
        bg: 'bg-[#fff8e1]',
        border: 'border-[#ffe082]',
        text: 'text-[#e65100]',
        icon: 'pending_actions',
        iconColor: 'text-[#f57f17]',
      };
    }
    if (error.type === 'ACCOUNT_REJECTED') {
      return {
        bg: 'bg-error-container',
        border: 'border-[#ef9a9a]',
        text: 'text-on-error-container',
        icon: 'cancel',
        iconColor: 'text-error',
      };
    }
    return {
      bg: 'bg-error-container',
      border: 'border-[#ef9a9a]',
      text: 'text-on-error-container',
      icon: 'error',
      iconColor: 'text-error',
    };
  };

  const errorStyle = getErrorStyle();

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
          <div className={`mb-5 p-4 ${errorStyle.bg} border ${errorStyle.border} rounded-lg flex items-start gap-3`}>
            <span
              className={`material-symbols-outlined ${errorStyle.iconColor} flex-shrink-0`}
              style={{ fontSize: '18px' }}
            >
              {errorStyle.icon}
            </span>
            <div>
              <p className={`text-[14px] font-medium ${errorStyle.text}`}>
                {error.message}
              </p>
              {error.type === 'ACCOUNT_PENDING' && (
                <p className="text-[12px] text-[#f57f17] mt-1">
                  Your account is under review. Contact your PG admin for faster approval.
                </p>
              )}
              {error.type === 'ACCOUNT_REJECTED' && (
                <p className="text-[12px] text-on-error-container mt-1">
                  You can{' '}
                  <Link to="/register" className="underline font-semibold">
                    register again
                  </Link>{' '}
                  or contact admin directly.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="font-label-md text-on-surface mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
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
                onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
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
            className="w-full bg-secondary-container hover:bg-secondary text-on-primary font-label-md py-3 rounded-md transition-colors mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                Sign In
              </>
            )}
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

        {/* Divider */}
        <div className="flex items-center gap-3 mt-6">
          <hr className="flex-1 border-outline-variant" />
          <span className="text-[12px] text-on-surface-variant">OR</span>
          <hr className="flex-1 border-outline-variant" />
        </div>

        {/* Register Link */}
        <p className="text-center mt-4 text-body-md text-on-surface-variant">
          New tenant?{' '}
          <Link
            to="/register"
            className="text-secondary-container font-semibold hover:underline"
          >
            Request Access →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
