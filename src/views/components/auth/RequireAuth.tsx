import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
// Update the import path if AuthContext is located elsewhere, for example:
import { useAuth } from '../../../context/AuthContext';
// Or create the file at '../../context/AuthContext.tsx' if it does not exist.

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

const RequireAuth = ({ children, roles = [] }: RequireAuthProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;