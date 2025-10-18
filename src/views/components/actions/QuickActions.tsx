import { Mail, AlertTriangle, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: Mail, 
      label: 'Send Announcement', 
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/announcements'
    },
    { 
      icon: AlertTriangle, 
      label: 'View Complaints', 
      color: 'bg-red-100 text-red-600',
      link: '/admin/complaints'
    },
    { 
      icon: UserPlus, 
      label: 'Add New User', 
      color: 'bg-green-100 text-green-600',
      link: '/admin/users'
    },
    { 
      icon: FileText, 
      label: 'Generate Report', 
      color: 'bg-purple-100 text-purple-600',
      link: '/admin/reports'
    }
  ];

  const handleActionClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => handleActionClick(action.link)}
          className={`p-3 rounded-lg flex flex-col items-center justify-center ${action.color} hover:opacity-90 transition-all hover:scale-105 transform`}
        >
          <action.icon className="w-5 h-5 mb-2" />
          <span className="text-xs font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;