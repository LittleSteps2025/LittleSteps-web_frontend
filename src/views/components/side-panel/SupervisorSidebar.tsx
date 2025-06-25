import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  Bell,
  FileText,
  Heart,
  CreditCard,
  ClipboardList
} from 'lucide-react';

const SupervisorSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/supervisor', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/supervisor/parents', icon: Users, label: 'Parents' },
    { path: '/supervisor/students', icon: Users, label: 'Students' },
    { path: '/supervisor/teachers', icon: Users, label: 'Teachers' },
    { path: '/supervisor/payments', icon: CreditCard, label: 'Payments' },
    { path: '/supervisor/announcements', icon: Bell, label: 'Announcements' },
    { path: '/supervisor/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/supervisor/health-records', icon: Heart, label: 'Health Records' },
    { path: '/supervisor/attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/supervisor/activities', icon: BookOpen, label: 'Activities' },
    { path: '/supervisor/reports', icon: FileText, label: 'Reports' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#4f46e5] to-[#7c73e6] text-white flex flex-col border-r border-[#7c73e6]">
      <div className="p-6 border-b border-[#7c73e6] flex items-center space-x-3">
        <img src="/logo-white.png" alt="Logo" className="h-8" />
        <h1 className="text-xl font-bold">LittleSteps</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 rounded-lg transition-all ${
              location.pathname === item.path ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-[#7c73e6]">
       
      </div>
    </div>
  );
};

export default SupervisorSidebar;