import { Activity, Calendar, Search, Plus, Users, Clock } from 'lucide-react';

const Activities = () => {
  const activities = [
    { 
      id: 1,
      name: 'Art Class',
      date: '2023-05-18',
      time: '10:00 AM',
      duration: '1 hour',
      participants: 12,
      location: 'Art Room'
    },
    { 
      id: 2,
      name: 'Music Lesson',
      date: '2023-05-19',
      time: '02:30 PM',
      duration: '45 mins',
      participants: 8,
      location: 'Music Room'
    },
    { 
      id: 3,
      name: 'Outdoor Play',
      date: '2023-05-20',
      time: '11:15 AM',
      duration: '1.5 hours',
      participants: 18,
      location: 'Playground'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Activity className="mr-2 text-[#4f46e5]" size={24} />
          Activities Schedule
        </h1>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Activity
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{activity.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="mr-2 w-4 h-4 text-indigo-600" />
                  {activity.date} at {activity.time}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 w-4 h-4 text-indigo-600" />
                  Duration: {activity.duration}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 w-4 h-4 text-indigo-600" />
                  Participants: {activity.participants}
                </div>
                <div className="flex items-center">
                  <svg className="mr-2 w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location: {activity.location}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="text-sm text-indigo-600 hover:text-indigo-900">
                  Edit
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Participants
                </button>
                <button className="text-sm text-red-600 hover:text-red-900">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;