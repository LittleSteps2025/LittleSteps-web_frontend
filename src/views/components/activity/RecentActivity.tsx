import { Clock } from 'lucide-react';

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
}

const RecentActivity = ({ activities }: { activities: Activity[] }) => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className="bg-[#f3eeff] p-2 rounded-full mr-3 mt-0.5">
            <Clock className="w-4 h-4 text-[#6339C0]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              <span className="font-semibold">{activity.user}</span> {activity.action}
            </p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;