import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#DDDCDB]">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="card-surface rounded-2xl p-8 md:p-12">
            <h1 className="text-4xl font-bold text-[#3C4044] text-center mb-4">Welcome to StaySecure</h1>
            <p className="text-center text-[#3C4044]/70 mb-10 text-lg">
              Your complete room booking and accommodation management system
            </p>
            <div className="text-center">
              <Link
                to="/dashboard"
                className="primary-btn inline-block px-8 py-3 rounded-lg font-bold shadow-sm"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DDDCDB] text-[#3C4044]">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FD7B41] text-white text-2xl shadow-md mb-5">🏨</div>
          <h1 className="text-5xl font-bold mb-4 text-[#3C4044]">StaySecure</h1>
          <p className="text-xl text-[#3C4044]/75 max-w-2xl mx-auto">
            Your complete room booking and accommodation management system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="card-surface p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-[#3C4044]">For Customers</h2>
            <p className="text-[#3C4044]/70 mb-6 leading-relaxed">
              Search for rooms, check availability, and make bookings with automatic or manual approval.
            </p>
            <Link
              to="/login"
              className="primary-btn inline-block px-6 py-3 rounded-lg font-bold"
            >
              Login as Customer
            </Link>
          </div>

          <div className="card-surface p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-[#3C4044]">For Administrators</h2>
            <p className="text-[#3C4044]/70 mb-6 leading-relaxed">
              Manage users, rooms, bookings, and system settings with strong operational control.
            </p>
            <Link
              to="/login"
              className="primary-btn inline-block px-6 py-3 rounded-lg font-bold"
            >
              Login as Admin
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[#3C4044]/75 mb-4 font-medium">New to StaySecure?</p>
          <Link
            to="/register"
            className="secondary-btn inline-block px-8 py-3 rounded-lg font-bold"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
