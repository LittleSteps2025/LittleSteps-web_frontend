import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../views/layouts/AdminLayout';
import Dashboard from '../views/admin/Dashboard';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        {/* Add more admin routes here */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;