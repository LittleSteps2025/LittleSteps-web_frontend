import { Users, Baby, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

interface Stats {
  totalChildren: number;
  activeParents: number;
  activeTeachers: number;

  attendanceRate: string | number;
 
  monthlyRevenue: number;
}

const StatsCards = ({ stats }: { stats: Stats }) => {
  const cards = [
    { 
      icon: Baby, 
      title: 'Total Children', 
      value: stats.totalChildren, 
      trend: '+12%',
      color: 'bg-purple-100 text-purple-800'
    },
    { 
      icon: Users, 
      title: 'Active Parents', 
      value: stats.activeParents, 
      trend: '+5%',
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      icon: Users, 
      title: 'Teachers', 
      value: stats.activeTeachers, 
      trend: '0%',
      color: 'bg-amber-100 text-amber-800'
    },
 
    { 
      icon: CheckCircle, 
      title: 'Attendance Rate', 
      value: stats.attendanceRate, 
      trend: '+3%',
      color: 'bg-green-100 text-green-800'
    },
   
    { 
      icon: DollarSign, 
      title: 'Monthly Revenue', 
      value: `$${stats.monthlyRevenue.toLocaleString()}`, 
      trend: '+15%',
      color: 'bg-emerald-100 text-emerald-800'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 text-xs font-medium flex items-center ${
            card.trend.startsWith('+') ? 'text-green-500' : 
            card.trend.startsWith('-') ? 'text-red-500' : 'text-gray-500'
          }`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${
              card.trend.startsWith('+') ? 'text-green-500' : 
              card.trend.startsWith('-') ? 'text-red-500' : 'text-gray-500'
            }`} />
            {card.trend} from last month
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;