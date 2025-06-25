import { Search, Plus, Mail, Calendar, Clock } from 'lucide-react';

const Announcements = () => {
  const announcements = [
    { id: 1, title: 'Parent-Teacher Meeting', content: 'Monthly meeting scheduled for next week', date: '2023-05-20', status: 'Active' },
    { id: 2, title: 'School Holiday', content: 'School will be closed on May 25th', date: '2023-05-25', status: 'Active' },
    { id: 3, title: 'Field Trip', content: 'Permission slips due by Friday', date: '2023-05-12', status: 'Expired' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  announcement.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {announcement.status}
                </span>
              </div>
              <div className="flex items-center mt-4 text-sm text-gray-500">
                <div className="flex items-center mr-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  {announcement.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {announcement.status === 'Active' ? 'Active' : 'Expired'}
                </div>
              </div>
              <div className="flex mt-4 space-x-3">
                <button className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-1" />
                  Resend
                </button>
                <button className="text-gray-600 hover:text-gray-900 flex items-center text-sm">
                  Edit
                </button>
                <button className="text-red-600 hover:text-red-900 flex items-center text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;