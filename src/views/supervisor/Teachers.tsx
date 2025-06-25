import { Users, Search, Plus, Mail, Phone, Calendar } from 'lucide-react';

const Teachers = () => {
  const teachers = [
    { id: 1, name: 'Emily Wilson', email: 'emily@example.com', phone: '555-1111', classroom: 'Sunflower', subjects: ['Math', 'Science'] },
    { id: 2, name: 'David Rodriguez', email: 'david@example.com', phone: '555-2222', classroom: 'Butterfly', subjects: ['Language', 'Arts'] },
    { id: 3, name: 'Jessica Lee', email: 'jessica@example.com', phone: '555-3333', classroom: 'Rainbow', subjects: ['Music', 'Dance'] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Teachers Management</h1>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.classroom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="mr-2 w-4 h-4" />
                      {teacher.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Phone className="mr-2 w-4 h-4" />
                      {teacher.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Teachers;