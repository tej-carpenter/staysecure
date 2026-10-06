import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const demoPassword = 'TempPassword123!';
const demoAccounts = [
  { label: 'Admin', email: 'admin+demo@example.com' },
  { label: 'Customer', email: 'customer+demo@example.com' },
  { label: 'Hotel Manager', email: 'hotelmanager+demo@example.com' },
  { label: 'Receptionist', email: 'reception+demo@example.com' },
  { label: 'Accountant', email: 'accountant+demo@example.com' },
];

const Login = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const useDemoAccount = (email) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', demoPassword, { shouldValidate: true });
    setError('');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(data);
      if (response.data.success) {
        login(response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DDDCDB] px-4 py-10">
      <div className="card-surface w-full max-w-md rounded-2xl p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FD7B41] text-white text-2xl mb-4">🏨</div>
          <h2 className="text-3xl font-bold text-[#3C4044]">StaySecure</h2>
        </div>
        <h3 className="text-2xl font-bold text-center mb-6 text-[#3C4044]">Login</h3>

        {error && (
          <div className="bg-[#3C4044] text-white px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {location.state?.message && !error && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-3 rounded-lg mb-4 text-sm">
            {location.state.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-[#3C4044] font-bold mb-2">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email',
                },
              })}
              className="w-full px-4 py-3 border border-[#DDDCDB] rounded-lg bg-white text-[#3C4044]"
              placeholder="admin@example.com"
            />
            {errors.email && <p className="text-[#3C4044] text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-[#3C4044] font-bold mb-2">Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full px-4 py-3 border border-[#DDDCDB] rounded-lg bg-white text-[#3C4044]"
              placeholder="password123"
            />
            {errors.password && <p className="text-[#3C4044] text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full primary-btn font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-[#3C4044]/75 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FD7B41] hover:text-[#f56d34] font-bold">
            Register
          </Link>
        </p>

        <div className="mt-6 border-t border-[#DDDCDB] pt-4">
          <p className="text-xs text-[#3C4044]/75 text-center mb-3 font-semibold">Demo Credentials:</p>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => useDemoAccount(account.email)}
                className="rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-left text-xs font-semibold text-[#3C4044]/80 transition hover:border-[#FD7B41] hover:text-[#3C4044]"
              >
                {account.label}: {account.email}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-[#3C4044]/80">
            <p>🔑 Password for all: {demoPassword}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
