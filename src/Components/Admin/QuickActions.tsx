import { Plus, Mail, AlertTriangle, UserPlus, FileText } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { icon: Mail, label: 'Send Announcement', color: 'bg-blue-100 text-blue-600' },
    { icon: AlertTriangle, label: 'Report Issue', color: 'bg-red-100 text-red-600' },
    { icon: UserPlus, label: 'Add New User', color: 'bg-green-100 text-green-600' },
    { icon: FileText, label: 'Generate Report', color: 'bg-purple-100 text-purple-600' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          className={`p-3 rounded-lg flex flex-col items-center justify-center ${action.color} hover:opacity-90 transition-opacity`}
        >
          <action.icon className="w-5 h-5 mb-2" />
          <span className="text-xs font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;