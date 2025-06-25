import { Route, Routes } from 'react-router-dom';
import SupervisorLayout from '../views/layouts/SupervisorLayout';
import SupervisorDashboard from '../views/supervisor/Dashboard';
import Parents from '../views/supervisor/Parents';
import Students from '../views/supervisor/Students';
import Teachers from '../views/supervisor/Teachers';
import Payments from '../views/supervisor/Payments';
import Announcements from '../views/supervisor/Announcements';
import Appointments from '../views/supervisor/Appointments';
import HealthRecords from '../views/supervisor/HealthRecords';
import Attendance from '../views/supervisor/Attendance';
import Activities from '../views/supervisor/Activities';
import Reports from '../views/supervisor/Reports';




const SupervisorRoutes = () => {
  return (
    <Routes>
      <Route element={<SupervisorLayout />}>
        <Route index element={<SupervisorDashboard />} />
        <Route path="dashboard" element={<SupervisorDashboard />} />
        <Route path="parents" element={<Parents />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="payments" element={<Payments />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="health-records" element={<HealthRecords />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="activities" element={<Activities />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
};

export default SupervisorRoutes;