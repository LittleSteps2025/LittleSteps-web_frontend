import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './views/Home';
import Login from './views/auth/Login';
import Signup from './views/auth/Signup';
import RequireAuth from './views/components/auth/RequireAuth';
import Footer from './views/components/footer/Footer';
import Layout from './views/layouts/Layout';
import AdminLayout from './views/layouts/AdminLayout'; // Create this component
import SupervisorLayout from './views/layouts/SupervisorLayout'; // Create this component
import Unauthorized from './views/Unauthorized';
import AdminDashboard from './views/admin/Dashboard'; // Your admin dashboard component
import SupervisorDashboard from './views/supervisor/Dashboard'; // Your supervisor dashboard component
import UserManagement from './views/admin/UserManagement';
import SubscriptionsManagement from './views/admin/SubscriptionsManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes with common layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Protected admin routes with admin layout */}
          <Route
            path="/admin"
            element={
              <RequireAuth roles={['admin']}>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            {/* Add more admin sub-routes here */}
            <Route path="users" element={<UserManagement />} />
            <Route path="subscriptions" element={<SubscriptionsManagement />} />
          </Route>

          {/* Protected supervisor routes with supervisor layout */}
          <Route
            path="/supervisor"
            element={
              <RequireAuth roles={['supervisor']}>
                <SupervisorLayout />
              </RequireAuth>
            }
          >
            <Route index element={<SupervisorDashboard />} />
            {/* Add more supervisor sub-routes here */}
          </Route>

          {/* 404 catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;