import { Users, Baby, DollarSign, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalChildren: number;
  activeParents: number;
  activeTeachers: number;
  todayCheckIns: number;
  monthlyRevenue: number;
  activeSupervisors?: number;
}

const StatsCards = ({ stats }: { stats: Stats }) => {
  const navigate = useNavigate();

  const cards = [
    { 
      icon: Baby, 
      title: 'Total Children', 
      value: stats.totalChildren, 
      color: 'bg-purple-100 text-purple-800',
      link: '/admin/children'
    },
    { 
      icon: Users, 
      title: 'Active Parents', 
      value: stats.activeParents, 
      color: 'bg-blue-100 text-blue-800',
      link: '/admin/parents'
    },
    { 
      icon: Users, 
      title: 'Teachers', 
      value: stats.activeTeachers, 
      color: 'bg-amber-100 text-amber-800',
      link: '/admin/users'
    },
    { 
      icon: CheckCircle, 
      title: "Today's Check-ins", 
      value: stats.todayCheckIns, 
      color: 'bg-cyan-100 text-cyan-800',
      link: '/admin/attendance'
    },
    { 
      icon: DollarSign, 
      title: 'Monthly Revenue', 
      value: stats.monthlyRevenue.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' }), 
      color: 'bg-emerald-100 text-emerald-800',
      link: '/admin/payments'
    },
  ];

  const handleCardClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          onClick={() => handleCardClick(card.link)}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-105 transform"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;