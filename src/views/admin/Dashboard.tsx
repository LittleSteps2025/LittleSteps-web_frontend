import { BarChart, Download } from 'lucide-react';
import StatsCards from '../components/stats/StatsCards';
import RecentActivity from '../components/activity/RecentActivity';
import QuickActions from '../components/actions/QuickActions';

const Dashboard = () => {
  const stats = {
    totalChildren: 5,
    activeParents: 5,
    activeTeachers: 3,
    activeSupervisors: 1,
    todayCheckIns: 5,
    monthlyRevenue: 27500,
   
  };

  const recentActivities = [
    { id: 1, user: 'Nimna Pathum', action: 'checked in', time: '10 min ago' },
    { id: 2, user: 'Irumi Theekshana', action: 'made payment', time: '25 min ago' },
    { id: 3, user: 'Nuwan Kumara', action: 'submitted complaint', time: '1 hour ago' },
    { id: 4, user: 'Devinda Perera', action: 'registered child', time: '2 hours ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex space-x-3">
          
        </div>
      </div>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Monthly Check-ins</h2>
            <div className="flex space-x-2">
              <select className="select-small" aria-label="Select time period">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
              <button className="btn-icon-small" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-80 bg-gradient-to-br from-[#f9f6ff] to-[#f0e9ff] rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart className="w-12 h-12 mx-auto text-[#6339C0]" />
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
              <button className="text-sm text-[#6339C0] hover:underline">View All</button>
            </div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;