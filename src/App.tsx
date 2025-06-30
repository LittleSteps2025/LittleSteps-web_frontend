import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './views/Home';
import Login from './views/auth/Login';
import Signup from './views/auth/Signup';
import RequireAuth from './views/components/auth/RequireAuth';
import Footer from './views/components/footer/Footer';
import Layout from './views/layouts/Layout';
import AdminLayout from './views/layouts/AdminLayout';
import SupervisorLayout from './views/layouts/SupervisorLayout';
import Unauthorized from './views/Unauthorized';

// Import admin components
import AdminDashboard from './views/admin/Dashboard';
import AdminUsers from './views/admin/Users';
import AdminChildren from './views/admin/Children';
import AdminSubscriptions from './views/admin/Subscriptions';
import AdminComplaints from './views/admin/Complaints';
import AdminAttendance from './views/admin/Attendance';
import AdminAnnouncements from './views/admin/Announcements';
import AdminReports from './views/admin/Reports';
import AdminActivities from './views/admin/Activities';
import AdminSettings from './views/admin/Settings';
import AdminSupport from './views/admin/Support';

// Import supervisor components
import SupervisorDashboard from './views/supervisor/Dashboard';
import SupervisorParents from './views/supervisor/Parents';
import SupervisorStudents from './views/supervisor/Students';
import SupervisorTeachers from './views/supervisor/Teachers';
import SupervisorPayments from './views/supervisor/Payments';
import SupervisorAnnouncements from './views/supervisor/Announcements';
import SupervisorAppointments from './views/supervisor/Appointments';
import SupervisorHealthRecords from './views/supervisor/HealthRecords';
import SupervisorAttendance from './views/supervisor/Attendance';
import SupervisorActivities from './views/supervisor/Activities';
import SupervisorReports from './views/supervisor/Reports';

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
            <Route path="users" element={<AdminUsers />} />
            <Route path="children" element={<AdminChildren />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="activities" element={<AdminActivities />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="support" element={<AdminSupport />} />
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
            <Route path="parents" element={<SupervisorParents />} />
            <Route path="students" element={<SupervisorStudents />} />
            <Route path="teachers" element={<SupervisorTeachers />} />
            <Route path="payments" element={<SupervisorPayments />} />
            <Route path="announcements" element={<SupervisorAnnouncements />} />
            <Route path="appointments" element={<SupervisorAppointments />} />
            <Route path="health-records" element={<SupervisorHealthRecords />} />
            <Route path="attendance" element={<SupervisorAttendance />} />
            <Route path="activities" element={<SupervisorActivities />} />
            <Route path="reports" element={<SupervisorReports />} />
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