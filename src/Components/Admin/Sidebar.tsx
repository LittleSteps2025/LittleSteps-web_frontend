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
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/children', icon: Baby, label: 'Child Management' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/complaints', icon: AlertCircle, label: 'Complaints' },
    { path: '/admin/announcements', icon: Bell, label: 'Announcements' },
    { path: '/admin/reports', icon: PieChart, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/compliance', icon: Shield, label: 'Compliance' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' }
  ];

  return (
    <div className="w-64 bg-[#6339C0] text-white flex flex-col">
      <div className="p-4 border-b border-[#7e57ff]">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 rounded-lg transition ${location.pathname === item.path ? 'bg-[#7e57ff]' : 'hover:bg-[#7e57ff]/50'}`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;