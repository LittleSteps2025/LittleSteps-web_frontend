import { Outlet } from 'react-router-dom';
import SupervisorSidebar from '../components/side-panel/SupervisorSidebar';
import SupervisorNavbar from '../components/navbar/SupervisorNavbar';
import { NotificationProvider } from '../../context/NotificationContext';

const SupervisorLayout = () => {
  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-50">
        <SupervisorSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SupervisorNavbar />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default SupervisorLayout;