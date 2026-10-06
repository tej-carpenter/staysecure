import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#3C4044] text-white shadow-lg border-b border-[#3C4044]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white hover:text-[#EDBF9B] transition">
            🏨 StaySecure
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-white/85">Welcome, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md font-medium bg-[#FD7B41] text-white hover:bg-[#f56d34] transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md transition text-white hover:bg-white/10 hover:text-[#EDBF9B]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md font-medium bg-[#FD7B41] text-white hover:bg-[#f56d34] transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
