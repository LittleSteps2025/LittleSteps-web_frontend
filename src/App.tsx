import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './views/Home';
import Login from './views/auth/Login';
import Signup from './views/auth/Signup';
import RequireAuth from './views/components/auth/RequireAuth';
import Footer from './views/components/footer/Footer';
import Layout from './views/layouts/Layout';
import AdminRoutes from './routes/AdminRoutes';
import SupervisorRoutes from './routes/SupervisorRoutes';
import Unauthorized from './views/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Protected admin routes */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth roles={['admin']}>
                <AdminRoutes />
              </RequireAuth>
            }
          />

          {/* Protected supervisor routes */}
          <Route
            path="/supervisor/*"
            element={
              <RequireAuth roles={['supervisor']}>
                <SupervisorRoutes />
              </RequireAuth>
            }
          />

          {/* 404 catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;