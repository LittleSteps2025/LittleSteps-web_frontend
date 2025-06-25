import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../Components/Admin/AdminLayout';
import Dashboard from '../Pages/Admin/Dashboard';


const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        
      </Route>
    </Routes>
  );
};

export default AdminRoutes;