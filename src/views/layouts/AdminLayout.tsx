import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/side-panel/AdminSidebar';
import AdminNavbar from '../components/navbar/AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;