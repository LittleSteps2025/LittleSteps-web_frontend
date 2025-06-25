import { Calendar, Search, Plus, User, Check, X } from 'lucide-react';

const Appointments = () => {
  const appointments = [
    { id: 1, parent: 'John Smith', student: 'Emma Johnson', date: '2023-05-18', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, parent: 'Sarah Johnson', student: 'Olivia Smith', date: '2023-05-19', time: '02:30 PM', status: 'Pending' },
    { id: 3, parent: 'Michael Chen', student: 'Liam Chen', date: '2023-05-20', time: '11:15 AM', status: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm text-gray-500">Total Appointments</h3>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm text-gray-500">Confirmed</h3>
            <p className="text-2xl font-bold">18</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm text-gray-500">Pending</h3>
            <p className="text-2xl font-bold">4</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm text-gray-500">Cancelled</h3>
            <p className="text-2xl font-bold">2</p>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent/Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.parent}</div>
                        <div className="text-sm text-gray-500">{appointment.student}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {appointment.status === 'Pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900 mr-3 flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          Confirm
                        </button>
                        <button className="text-red-600 hover:text-red-900 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    {appointment.status === 'Confirmed' && (
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Reschedule
                      </button>
                    )}
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

export default Appointments;