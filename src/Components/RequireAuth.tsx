import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Mock authentication and role check for development/demo
const useAuth = () => {
  // MOCK: Always return an admin user for testing
  return {
    name: 'Admin User',
    email: 'admin@littlesteps.com',
    role: 'admin'
  };
  // For real app, use: JSON.parse(localStorage.getItem('user') || 'null');
};

interface RequireAuthProps {
  roles: string[];
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ roles, children }) => {
  const location = useLocation();
  const user = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    // Not authorized for this role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
