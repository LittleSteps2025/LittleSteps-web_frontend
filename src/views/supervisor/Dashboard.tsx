import { BarChart, Download, Calendar, Bell, ClipboardList, Users, Baby } from 'lucide-react';
import StatsCards from '../components/stats/StatsCards';
import RecentActivity from '../components/activity/RecentActivity';
import QuickActions from '../components/actions/QuickActions';

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
    monthlyRevenue: 5000,
    immunizationDue: 3,
    activitiesToday: 4
  };

  const recentActivities = [
    { id: 1, user: 'Emma Johnson', action: 'checked in', time: '15 min ago', icon: Baby },
    { id: 2, user: 'Liam Chen', action: 'completed health check', time: '30 min ago', icon: ClipboardList },
    { id: 3, user: 'Olivia Smith', action: 'submitted observation', time: '2 hours ago', icon: Users },
    { id: 4, user: 'Michael Brown', action: 'scheduled parent meeting', time: '3 hours ago', icon: Calendar }
  ];

  const quickActions = [
    { icon: Bell, label: 'Send Announcement', color: 'bg-blue-100 text-blue-600', path: '/supervisor/announcements' },
    { icon: ClipboardList, label: 'Record Attendance', color: 'bg-green-100 text-green-600', path: '/supervisor/attendance' },
    { icon: Baby, label: 'Add Health Record', color: 'bg-purple-100 text-purple-600', path: '/supervisor/health-records' },
    { icon: Calendar, label: 'Schedule Activity', color: 'bg-orange-100 text-orange-600', path: '/supervisor/activities' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Supervisor Dashboard
          </span>
        </h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
              aria-label="Select date range"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
        </div>
      </div>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart className="mr-2 text-[#4f46e5]" size={20} />
              Weekly Overview
            </h2>
            <div className="flex space-x-2">
              <select className="select-small" aria-label="Select time period">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
              <button className="btn-icon-small" title="Download Report">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-80 bg-gradient-to-br from-[#f0f5ff] to-[#e6eeff] rounded-xl flex items-center justify-center">
            <div className="text-center p-6">
              <BarChart className="w-12 h-12 mx-auto text-[#4f46e5]" />
              <p className="mt-2 text-gray-500">Supervisor analytics dashboard</p>
              <p className="text-sm text-gray-400 mt-1">Attendance, activities, and health data visualization</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <ClipboardList className="mr-2 text-[#4f46e5]" size={20} />
                Quick Actions
              </h2>
            </div>
            <QuickActions actions={quickActions} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Bell className="mr-2 text-[#4f46e5]" size={20} />
                Recent Activity
              </h2>
              <button className="text-sm text-[#4f46e5] hover:underline">View All</button>
            </div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Calendar className="mr-2 text-[#4f46e5]" size={20} />
            Upcoming Events
          </h2>
          <button className="text-sm text-[#4f46e5] hover:underline">View Calendar</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 1, title: 'Parent-Teacher Meeting', date: 'Tomorrow, 10:00 AM', location: 'Conference Room' },
            { id: 2, title: 'Field Trip', date: 'May 25, 9:00 AM', location: 'City Museum' },
            { id: 3, title: 'Health Checkup', date: 'May 28, 1:00 PM', location: 'Clinic' },
            { id: 4, title: 'Staff Training', date: 'June 2, 3:00 PM', location: 'Training Room' }
          ].map(event => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{event.date}</p>
              <p className="text-xs text-gray-500 mt-2">{event.location}</p>
              <button className="mt-3 text-xs text-[#4f46e5] hover:underline">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;