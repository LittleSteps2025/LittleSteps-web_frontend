import { CalendarCheck, Search, Plus, Calendar, X, User, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

const Attendance = () => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const attendanceData = [
    { 
      id: 1, 
      date: '2023-05-15',
      present: 18,
      absent: 2,
      percentage: '90%',
      students: [
        { id: 1, name: 'Emma Johnson', status: 'present' },
        { id: 2, name: 'Liam Chen', status: 'present' },
        { id: 3, name: 'Olivia Smith', status: 'absent' },
        { id: 4, name: 'Noah Williams', status: 'present' },
        { id: 5, name: 'Ava Brown', status: 'absent' },
        // ...more students
      ]
    },
    { 
      id: 2, 
      date: '2023-05-14',
      present: 17,
      absent: 3,
      percentage: '85%',
      students: [
        { id: 1, name: 'Emma Johnson', status: 'present' },
        { id: 2, name: 'Liam Chen', status: 'absent' },
        { id: 3, name: 'Olivia Smith', status: 'present' },
        { id: 4, name: 'Noah Williams', status: 'absent' },
        { id: 5, name: 'Ava Brown', status: 'present' },
        // ...more students
      ]
    },
    { 
      id: 3, 
      date: '2023-05-13',
      present: 20,
      absent: 0,
      percentage: '100%',
      students: [
        { id: 1, name: 'Emma Johnson', status: 'present' },
        { id: 2, name: 'Liam Chen', status: 'present' },
        { id: 3, name: 'Olivia Smith', status: 'present' },
        { id: 4, name: 'Noah Williams', status: 'present' },
        { id: 5, name: 'Ava Brown', status: 'present' },
        // ...more students
      ]
    }
  ];

  const openDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <CalendarCheck className="mr-2 text-[#4f46e5]" size={24} />
          Attendance Records
        </h1>
        
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Today's Attendance</h3>
          <p className="text-2xl font-bold">85%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">This Week</h3>
          <p className="text-2xl font-bold">92%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">This Month</h3>
          <p className="text-2xl font-bold">88%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Total Students</h3>
          <p className="text-2xl font-bold">21</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Search and Filter */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search attendance records..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-4">
            <select
              aria-label="Filter attendance records by date range"
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="mr-2 text-indigo-600" size={16} />
                      {record.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-green-600 font-medium">{record.present}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-red-600 font-medium">{record.absent}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {record.percentage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => openDetails(record)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Details Modal */}
      {isDetailOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Calendar className="mr-2 text-indigo-600" size={20} />
                  Attendance Details - {selectedRecord.date}
                </h2>
                <button 
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <UserCheck className="text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Present</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">{selectedRecord.present}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center">
                    <UserX className="text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">Absent</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-1">{selectedRecord.absent}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center">
                    <User className="text-indigo-600 mr-2" />
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{selectedRecord.present + selectedRecord.absent}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Attendance Percentage</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-indigo-600 h-4 rounded-full" 
                    style={{ width: selectedRecord.percentage }}
                  ></div>
                </div>
                <p className="text-right mt-1 text-sm text-gray-600">{selectedRecord.percentage}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Student List</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRecord.students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.status === 'present' ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Present
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;