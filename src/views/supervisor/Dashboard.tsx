import { BarChart, Download } from 'lucide-react';
import StatsCards from './../components/stats/StatsCards';
import RecentActivity from './../components/activity/RecentActivity';
import QuickActions from './../components/actions/QuickActions';

const SupervisorDashboard = () => {
  const stats = {
    totalChildren: 120,
    attendanceRate: '94%',
    activeParents: 90,
    pendingTasks: 8,
    upcomingEvents: 5,
    healthChecks: 12,
    activeTeachers: 15,
    activeSupervisors: 3,
    todayCheckIns: 110,
    pendingComplaints: 2,
    monthlyRevenue: 5000
  };

  const recentActivities = [
    { id: 1, user: 'Emma Johnson', action: 'checked in', time: '15 min ago' },
    { id: 2, user: 'Liam Chen', action: 'completed health check', time: '30 min ago' },
    { id: 3, user: 'Olivia Smith', action: 'submitted observation', time: '2 hours ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Supervisor Dashboard</h1>
        <div className="flex space-x-3">
         
        </div>
      </div>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Weekly Attendance</h2>
            <div className="flex space-x-2">
              <select className="select-small" aria-label="Select time period">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
              <button className="btn-icon-small" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-80 bg-gradient-to-br from-[#f0f5ff] to-[#e6eeff] rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart className="w-12 h-12 mx-auto text-[#4f46e5]" />
              <p className="mt-2 text-gray-500">Attendance analytics chart</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <QuickActions />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <button className="text-sm text-[#4f46e5] hover:underline">View All</button>
            </div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;