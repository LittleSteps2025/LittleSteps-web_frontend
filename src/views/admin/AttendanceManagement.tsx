import { useState } from 'react';
import {
  Calendar, Clock, User, UserCheck, UserX, Users, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Search, Filter, Download, Plus, MoreVertical,
  ArrowLeft, ArrowRight, ClipboardList, Clock as ClockIcon
} from 'lucide-react';

type AttendanceRecord = {
  id: string;
  date: string;
  person: {
    id: string;
    name: string;
    type: 'supervisor' | 'teacher' | 'child';
    classroom?: string;
    photo?: string;
  };
  status: 'present' | 'absent' | 'late' | 'leave';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
};

type Schedule = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  type: 'staff-meeting' | 'parent-teacher' | 'training' | 'event';
  location: string;
};

const attendanceData: AttendanceRecord[] = [
  {
    id: '1',
    date: '2023-06-15',
    person: {
      id: 's1',
      name: 'Jessica Brown',
      type: 'supervisor',
      photo: '/avatars/jessica.jpg'
    },
    status: 'present',
    checkIn: '08:15',
    checkOut: '17:30'
  },
  {
    id: '2',
    date: '2023-06-15',
    person: {
      id: 't1',
      name: 'Michael Smith',
      type: 'teacher',
      classroom: 'Sunflowers',
      photo: '/avatars/michael.jpg'
    },
    status: 'present',
    checkIn: '08:30',
    checkOut: '16:45'
  },
  {
    id: '3',
    date: '2023-06-15',
    person: {
      id: 'c1',
      name: 'Emma Johnson',
      type: 'child',
      classroom: 'Sunflowers',
      photo: '/avatars/emma.jpg'
    },
    status: 'present',
    checkIn: '08:45',
    checkOut: '15:30'
  },
  {
    id: '4',
    date: '2023-06-15',
    person: {
      id: 't2',
      name: 'David Wilson',
      type: 'teacher',
      classroom: 'Butterflies',
      photo: '/avatars/david.jpg'
    },
    status: 'late',
    checkIn: '09:15',
    checkOut: '17:00',
    notes: 'Car trouble'
  },
  {
    id: '5',
    date: '2023-06-15',
    person: {
      id: 'c2',
      name: 'Liam Smith',
      type: 'child',
      classroom: 'Butterflies',
      photo: '/avatars/liam.jpg'
    },
    status: 'absent',
    notes: 'Sick with fever'
  },
  {
    id: '6',
    date: '2023-06-14',
    person: {
      id: 's1',
      name: 'Jessica Brown',
      type: 'supervisor',
      photo: '/avatars/jessica.jpg'
    },
    status: 'present',
    checkIn: '08:00',
    checkOut: '17:45'
  },
  {
    id: '7',
    date: '2023-06-14',
    person: {
      id: 'c3',
      name: 'Olivia Williams',
      type: 'child',
      classroom: 'Caterpillars',
      photo: '/avatars/olivia.jpg'
    },
    status: 'leave',
    checkIn: '09:00',
    checkOut: '12:30',
    notes: 'Doctor appointment'
  }
];

const schedules: Schedule[] = [
  {
    id: '1',
    title: 'Staff Meeting',
    date: '2023-06-16',
    startTime: '16:00',
    endTime: '17:30',
    attendees: ['s1', 't1', 't2'],
    type: 'staff-meeting',
    location: 'Conference Room'
  },
  {
    id: '2',
    title: 'Parent-Teacher Conference',
    date: '2023-06-20',
    startTime: '14:00',
    endTime: '16:00',
    attendees: ['t1', 't2'],
    type: 'parent-teacher',
    location: 'Classrooms'
  },
  {
    id: '3',
    title: 'First Aid Training',
    date: '2023-06-22',
    startTime: '09:00',
    endTime: '12:00',
    attendees: ['s1', 't1', 't2'],
    type: 'training',
    location: 'Activity Room'
  },
  {
    id: '4',
    title: 'Summer Festival',
    date: '2023-06-30',
    startTime: '10:00',
    endTime: '14:00',
    attendees: ['s1', 't1', 't2'],
    type: 'event',
    location: 'Playground'
  }
];

const AttendanceManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<'attendance' | 'schedules'>('attendance');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    classroom: 'all'
  });
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);

  // Filter attendance data
  const filteredAttendance = attendanceData.filter(record => {
    const matchesDate = record.date === currentDate;
    const matchesSearch = record.person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.person.classroom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || record.person.type === filters.type;
    const matchesStatus = filters.status === 'all' || record.status === filters.status;
    const matchesClassroom = filters.classroom === 'all' || record.person.classroom === filters.classroom;
    
    return matchesDate && matchesSearch && matchesType && matchesStatus && matchesClassroom;
  });

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    return schedule.date >= currentDate;
  });

  // Group attendance by type
  const supervisors = filteredAttendance.filter(r => r.person.type === 'supervisor');
  const teachers = filteredAttendance.filter(r => r.person.type === 'teacher');
  const children = filteredAttendance.filter(r => r.person.type === 'child');

  // Get date info
  const dateObj = new Date(currentDate);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const dateNum = dateObj.getDate();
  const year = dateObj.getFullYear();

  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Status badge component
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const statusClasses = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      leave: 'bg-blue-100 text-blue-800'
    };
    const statusIcons = {
      present: <CheckCircle className="w-4 h-4 mr-1" />,
      absent: <XCircle className="w-4 h-4 mr-1" />,
      late: <ClockIcon className="w-4 h-4 mr-1" />,
      leave: <ArrowRight className="w-4 h-4 mr-1" />
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${statusClasses[status]}`}>
        {statusIcons[status]}
        {status}
      </span>
    );
  };

  // Schedule type badge component
  const getScheduleTypeBadge = (type: Schedule['type']) => {
    const typeClasses = {
      'staff-meeting': 'bg-purple-100 text-purple-800',
      'parent-teacher': 'bg-blue-100 text-blue-800',
      'training': 'bg-green-100 text-green-800',
      'event': 'bg-yellow-100 text-yellow-800'
    };
    const typeLabels = {
      'staff-meeting': 'Staff Meeting',
      'parent-teacher': 'Parent-Teacher',
      'training': 'Training',
      'event': 'Event'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${typeClasses[type]}`}>
        {typeLabels[type]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowAddAttendanceModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Attendance
          </button>
          <button 
            onClick={() => setShowAddScheduleModal(true)}
            className="btn-secondary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={goToPreviousDay}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={goToToday}
              className="btn-outline"
            >
              Today
            </button>
            <button 
              onClick={goToNextDay}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">{dayName}, {monthName} {dateNum}, {year}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setView('daily')}
              className={`px-3 py-1 text-sm rounded ${view === 'daily' ? 'bg-[#6339C0] text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Day
            </button>
            <button 
              onClick={() => setView('weekly')}
              className={`px-3 py-1 text-sm rounded ${view === 'weekly' ? 'bg-[#6339C0] text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setView('monthly')}
              className={`px-3 py-1 text-sm rounded ${view === 'monthly' ? 'bg-[#6339C0] text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendance' ? 'border-[#6339C0] text-[#6339C0]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <div className="flex items-center">
              <UserCheck className="w-4 h-4 mr-2" />
              Attendance Records
            </div>
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedules' ? 'border-[#6339C0] text-[#6339C0]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <div className="flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              Schedules
            </div>
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or classroom..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="dropdown relative">
              <button
                className="btn-outline flex items-center"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {showFilterDropdown ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="supervisor">Supervisors</option>
                        <option value="teacher">Teachers</option>
                        <option value="child">Children</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      >
                        <option value="all">All Statuses</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="leave">Early Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
                      <select
                        value={filters.classroom}
                        onChange={(e) => setFilters({...filters, classroom: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      >
                        <option value="all">All Classrooms</option>
                        <option value="Sunflowers">Sunflowers</option>
                        <option value="Butterflies">Butterflies</option>
                        <option value="Caterpillars">Caterpillars</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className="btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Content */}
      {activeTab === 'attendance' ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Supervisors</p>
                  <p className="text-2xl font-bold text-gray-800">{supervisors.length}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {supervisors.filter(s => s.status === 'present').length} present, 
                  {supervisors.filter(s => s.status === 'absent').length} absent
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Teachers</p>
                  <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {teachers.filter(t => t.status === 'present').length} present, 
                  {teachers.filter(t => t.status === 'absent').length} absent
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Children</p>
                  <p className="text-2xl font-bold text-gray-800">{children.length}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {children.filter(c => c.status === 'present').length} present, 
                  {children.filter(c => c.status === 'absent').length} absent
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classroom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In/Out
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {record.person.photo ? (
                                <img className="h-10 w-10 rounded-full" src={record.person.photo} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{record.person.name}</div>
                              <div className="text-sm text-gray-500">{record.person.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                            {record.person.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.person.classroom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkIn ? (
                            <span className="text-green-600">{record.checkIn}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                          {' / '}
                          {record.checkOut ? (
                            <span className="text-red-600">{record.checkOut}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {record.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-[#6339C0] hover:text-[#7e57ff]">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No attendance records found for this date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Schedules Content */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map(schedule => (
              <div key={schedule.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{schedule.title}</h3>
                    <div className="mt-1">
                      {getScheduleTypeBadge(schedule.type)}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-2" />
                    {schedule.attendees.length} attendees
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {schedule.location}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <button className="btn-outline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredSchedules.length === 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming schedules</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new schedule.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddScheduleModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Attendance Modal */}
      {showAddAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Attendance Record</h2>
                <button onClick={() => setShowAddAttendanceModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent">
                      <option value="">Select person</option>
                      <option value="s1">Jessica Brown (Supervisor)</option>
                      <option value="t1">Michael Smith (Teacher - Sunflowers)</option>
                      <option value="t2">David Wilson (Teacher - Butterflies)</option>
                      <option value="c1">Emma Johnson (Child - Sunflowers)</option>
                      <option value="c2">Liam Smith (Child - Butterflies)</option>
                      <option value="c3">Olivia Williams (Child - Caterpillars)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="leave">Early Leave</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      placeholder="Optional notes about attendance"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAttendanceModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Attendance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Schedule</h2>
                <button onClick={() => setShowAddScheduleModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      placeholder="e.g., Staff Meeting, Parent Conference"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent">
                      <option value="staff-meeting">Staff Meeting</option>
                      <option value="parent-teacher">Parent-Teacher Conference</option>
                      <option value="training">Training</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <div className="flex space-x-2">
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                        />
                        <span className="flex items-center">to</span>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      placeholder="e.g., Conference Room, Playground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="attendee-s1"
                          name="attendees[]"
                          type="checkbox"
                          className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                        />
                        <label htmlFor="attendee-s1" className="ml-2 block text-sm text-gray-900">
                          Jessica Brown (Supervisor)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="attendee-t1"
                          name="attendees[]"
                          type="checkbox"
                          className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                        />
                        <label htmlFor="attendee-t1" className="ml-2 block text-sm text-gray-900">
                          Michael Smith (Teacher)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="attendee-t2"
                          name="attendees[]"
                          type="checkbox"
                          className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                        />
                        <label htmlFor="attendee-t2" className="ml-2 block text-sm text-gray-900">
                          David Wilson (Teacher)
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      placeholder="Optional description of the schedule"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddScheduleModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;