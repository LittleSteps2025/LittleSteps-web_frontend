import { Outlet } from 'react-router-dom';
import SupervisorSidebar from '../components/side-panel/SupervisorSidebar';

const SupervisorLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;