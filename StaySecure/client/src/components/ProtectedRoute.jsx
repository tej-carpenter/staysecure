import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#DDDCDB]">
        <div className="text-xl font-semibold text-[#3C4044]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#DDDCDB]">
        <div className="text-center card-surface rounded-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-[#3C4044]">Access Denied</h1>
          <p className="text-[#3C4044]/70 mt-2">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
