import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Baby,
  CreditCard,
  AlertCircle,
  Bell,
  Settings,
  FileText,
  PieChart,
  Shield,
  Calendar,
  BookOpen,
  LifeBuoy
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/children', icon: Baby, label: 'Child Management' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },

    { path: '/admin/complaints', icon: AlertCircle, label: 'Complaints' },
    { path: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/admin/announcements', icon: Bell, label: 'Announcements' },
    { path: '/admin/reports', icon: PieChart, label: 'Reports' },
    { path: '/admin/activities', icon: BookOpen, label: 'Activities' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/support', icon: LifeBuoy, label: 'Support' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#6339C0] to-[#8a63ff] text-white flex flex-col border-r border-[#7e57ff]">
      <div className="p-6 border-b border-[#7e57ff] flex items-center space-x-3">
        <img src="/logo-white.png" alt="Logo" className="h-8" />
        <h1 className="text-xl font-bold">LittleSteps</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 rounded-lg transition-all ${location.pathname === item.path ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-[#7e57ff]">
        <div className="text-xs text-white/70">v2.1.0</div>
      </div>
    </div>
  );
};

export default AdminSidebar;