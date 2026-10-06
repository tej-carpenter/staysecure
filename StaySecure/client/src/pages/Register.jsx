import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.register(data);
      if (response.data.success) {
        navigate('/login', { state: { message: response.data.message } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DDDCDB] px-4 py-10">
      <div className="card-surface w-full max-w-lg rounded-2xl p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FD7B41] text-white text-2xl mb-4">🏨</div>
          <h2 className="text-3xl font-bold text-[#3C4044]">StaySecure</h2>
        </div>
        <h3 className="text-2xl font-bold text-center mb-6 text-[#3C4044]">Register</h3>

        {error && (
          <div className="bg-[#3C4044] text-white px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-[#3C4044] font-bold mb-2">Full Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-3 border border-[#DDDCDB] rounded-lg bg-white text-[#3C4044]"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-[#3C4044] text-sm mt-1">{errors.name.message}</p>}
          </div>

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
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-[#3C4044] text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-[#3C4044] font-bold mb-2">Phone</label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone is required' })}
              className="w-full px-4 py-3 border border-[#DDDCDB] rounded-lg bg-white text-[#3C4044]"
              placeholder="9123456789"
            />
            {errors.phone && <p className="text-[#3C4044] text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div className="mb-4">
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

          <div className="mb-6">
            <label className="block text-[#3C4044] font-bold mb-2">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              className="w-full px-4 py-3 border border-[#DDDCDB] rounded-lg bg-white text-[#3C4044]"
              placeholder="password123"
            />
            {errors.confirmPassword && <p className="text-[#3C4044] text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full primary-btn font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-[#3C4044]/75 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FD7B41] hover:text-[#f56d34] font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
