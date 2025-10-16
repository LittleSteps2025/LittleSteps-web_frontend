import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/sixth-logo.png';
import {
  LayoutDashboard,
  Users,
  Baby,
  CreditCard,
  AlertCircle,
  Bell,
  Settings,
  PieChart,
  Calendar,
  BookOpen,
  LifeBuoy
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Supervisor and Teachers' },
    { path: '/admin/children', icon: Baby, label: 'Child Details' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/admin/complaints', icon: AlertCircle, label: 'Complaints' },
    // { path: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/admin/announcements', icon: Bell, label: 'Announcements' },
    { path: '/admin/reports', icon: PieChart, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#4f46e5] to-[#7c73e6] text-white flex flex-col border-r border-[#7e57ff]">
      <div className="p-6 border-b border-[#7e57ff] flex items-center space-x-3">
        <img 
              src={logo} // Replace with your logo path 
              alt="Little Steps Logo" 
              className="h-15 w-auto"
            />
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 rounded-lg transition-all ${
              location.pathname === item.path 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-[#7e57ff]">
        <button
          onClick={handleLogout}
          className="flex items-center p-3 rounded-lg transition-all w-full hover:bg-red-500/20 text-white hover:text-red-200 text-left"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;