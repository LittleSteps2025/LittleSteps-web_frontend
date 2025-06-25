import { Route, Routes } from 'react-router-dom';
import SupervisorLayout from '../views/layouts/SupervisorLayout';
import SupervisorDashboard from '../views/supervisor/Dashboard';
import Parents from '../views/supervisor/Parents';
import Students from '../views/supervisor/Students';

const SupervisorRoutes = () => {
  return (
    <Routes>
      <Route element={<SupervisorLayout />}>
        <Route index element={<SupervisorDashboard />} />
        <Route path="dashboard" element={<SupervisorDashboard />} />
        <Route path="parents" element={<Parents />} />
        <Route path="students" element={<Students />} />
      </Route>
    </Routes>
  );
};

export default SupervisorRoutes;