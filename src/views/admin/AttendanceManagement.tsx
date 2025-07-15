import { useState } from 'react';
import {
  Calendar, Clock, User, UserCheck, UserX, CheckCircle, XCircle,
  Download, Plus, MoreVertical, ArrowLeft, ArrowRight, ClipboardList,
  Clock as BarChart2, Baby, CalendarDays, FileText, X
} from 'lucide-react';

// Types
type Person = {
  id: string;
  name: string;
  type: 'supervisor' | 'teacher' | 'child';
  role?: string;
  classroom?: string;
  photo?: string;
};

type AttendanceRecord = {
  id: string;
  date: string;
  personId: string;
  status: 'present' | 'absent';
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
  description?: string;
};

// Sample Data
const people: Person[] = [
  { id: 'c1', name: 'Emma Johnson', type: 'child', classroom: 'Sunflowers', photo: '/avatars/emma.jpg' },
  { id: 'c2', name: 'Liam Smith', type: 'child', classroom: 'Butterflies', photo: '/avatars/liam.jpg' },
  { id: 'c3', name: 'Olivia Williams', type: 'child', classroom: 'Caterpillars', photo: '/avatars/olivia.jpg' }
];

const attendanceRecords: AttendanceRecord[] = [
  // Current day records
  { id: '1', date: '2023-06-20', personId: 's1', status: 'present', checkIn: '08:15', checkOut: '17:30' },
  { id: '2', date: '2023-06-20', personId: 't1', status: 'present', checkIn: '08:30', checkOut: '16:45' },
  { id: '4', date: '2023-06-20', personId: 'c1', status: 'present', checkIn: '08:45', checkOut: '15:30' },
  { id: '5', date: '2023-06-20', personId: 'c2', status: 'absent', notes: 'Family vacation' },

  
  // Previous records for history
  { id: '7', date: '2023-06-19', personId: 's1', status: 'present', checkIn: '08:00', checkOut: '17:45' },
  { id: '8', date: '2023-06-19', personId: 't1', status: 'present', checkIn: '08:25', checkOut: '16:50' },
  { id: '9', date: '2023-06-18', personId: 't2', status: 'absent', notes: 'Sick leave' },
  { id: '10', date: '2023-06-17', personId: 'c1', status: 'present', checkIn: '08:50', checkOut: '15:45' }
];

const schedules: Schedule[] = [
  {
    id: '1',
    title: 'Staff Meeting',
    date: '2023-06-20',
    startTime: '16:00',
    endTime: '17:30',
    attendees: ['s1', 't1', 't2'],
    type: 'staff-meeting',
    location: 'Conference Room',
    description: 'Weekly staff meeting to discuss curriculum and upcoming events'
  },
  {
    id: '2',
    title: 'Parent-Teacher Conference',
    date: '2023-06-22',
    startTime: '14:00',
    endTime: '16:00',
    attendees: ['t1', 't2'],
    type: 'parent-teacher',
    location: 'Classrooms',
    description: 'Individual meetings with parents to discuss child progress'
  },
  {
    id: '3',
    title: 'First Aid Training',
    date: '2023-06-25',
    startTime: '09:00',
    endTime: '12:00',
    attendees: ['s1', 't1', 't2'],
    type: 'training',
    location: 'Activity Room',
    description: 'Certification renewal for all staff members'
  }
];

const AttendanceManagement = () => {
  const [currentDate, setCurrentDate] = useState('2023-06-20');
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<'summary' | 'calendar' | 'history'>('summary');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [, setSelectedPerson] = useState<Person | null>(null);

  // Get records for current date
  const currentRecords = attendanceRecords.filter(record => record.date === currentDate);
  
  // Get person details for each record
  const attendanceWithDetails = currentRecords.map(record => {
    const person = people.find(p => p.id === record.personId);
    return { ...record, person };
  });

  // Group by type

  const children = attendanceWithDetails.filter(r => r.person?.type === 'child');

  // Counts
  const presentCount = currentRecords.filter(r => r.status === 'present').length;
  const absentCount = currentRecords.filter(r => r.status === 'absent').length;


  // Upcoming schedules
  const upcomingSchedules = schedules.filter(s => s.date >= currentDate);

  // Get status badge
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const statusClasses = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
 
    };
    const statusIcons = {
      present: <CheckCircle className="w-4 h-4 mr-1" />,
      absent: <XCircle className="w-4 h-4 mr-1" />,
  
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${statusClasses[status]}`}>
        {statusIcons[status]}
        {status}
      </span>
    );
  };

  // Get schedule type badge
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarDays className="mr-2 text-[#6339C0]" />
            Attendance Management
          </h1>
          <div className="flex items-center space-x-4">
            <button className="btn-primary flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Date Navigation */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
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
              <h2 className="text-xl font-semibold text-gray-800">
                {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
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
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary' ? 'border-[#6339C0] text-[#6339C0]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center">
                <BarChart2 className="w-4 h-4 mr-2" />
                Summary
              </div>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar' ? 'border-[#6339C0] text-[#6339C0]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-[#6339C0] text-[#6339C0]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                History
              </div>
            </button>
          </nav>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Present</p>
                    <p className="text-2xl font-bold text-gray-800">{presentCount}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Absent</p>
                    <p className="text-2xl font-bold text-gray-800">{absentCount}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <UserX className="w-6 h-6" />
                  </div>
                </div>
              </div>
            
            </div>

            {/* Role Sections */}
            <div className="space-y-6">
              {/* Supervisors */}
              {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-purple-50 px-6 py-3 border-b border-purple-100 flex items-center">
                  <Shield className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-medium text-purple-800">Supervisors</h3>
                </div>
                <div className="p-4">
                  {supervisors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supervisors.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {record.person?.photo ? (
                                <img className="h-12 w-12 rounded-full" src={record.person.photo} alt="" />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{record.person?.name}</p>
                              <p className="text-sm text-gray-500">{record.person?.role}</p>
                              <div className="mt-2">
                                {getStatusBadge(record.status)}
                              </div>
                              {record.checkIn && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="text-green-600">{record.checkIn}</span> - 
                                  <span className="text-red-600"> {record.checkOut || '--:--'}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          {record.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">"{record.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No supervisor records for this date</p>
                  )}
                </div>
              </div> */}

              {/* Teachers */}
              {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center">
                  <UserCheck className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-blue-800">Teachers</h3>
                </div>
                <div className="p-4">
                  {teachers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teachers.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {record.person?.photo ? (
                                <img className="h-12 w-12 rounded-full" src={record.person.photo} alt="" />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{record.person?.name}</p>
                              <p className="text-sm text-gray-500">{record.person?.classroom} Classroom</p>
                              <div className="mt-2">
                                {getStatusBadge(record.status)}
                              </div>
                              {record.checkIn && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="text-green-600">{record.checkIn}</span> - 
                                  <span className="text-red-600"> {record.checkOut || '--:--'}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          {record.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">"{record.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No teacher records for this date</p>
                  )}
                </div>
              </div> */}

              {/* Children */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-green-50 px-6 py-3 border-b border-green-100 flex items-center">
                  <Baby className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-green-800">Children</h3>
                </div>
                <div className="p-4">
                  {children.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {children.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {record.person?.photo ? (
                                <img className="h-12 w-12 rounded-full" src={record.person.photo} alt="" />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{record.person?.name}</p>
                              <p className="text-sm text-gray-500">{record.person?.classroom} Classroom</p>
                              <div className="mt-2">
                                {getStatusBadge(record.status)}
                              </div>
                              {record.checkIn && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="text-green-600">{record.checkIn}</span> - 
                                  <span className="text-red-600"> {record.checkOut || '--:--'}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          {record.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">"{record.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No child records for this date</p>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Schedules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center justify-between">
                <div className="flex items-center">
                  <ClipboardList className="w-5 h-5 text-amber-600 mr-2" />
                  <h3 className="text-lg font-medium text-amber-800">Upcoming Schedules</h3>
                </div>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="btn-primary-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Schedule
                </button>
              </div>
              <div className="p-4">
                {upcomingSchedules.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSchedules.map(schedule => (
                      <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">{schedule.title}</h4>
                            <div className="mt-1">
                              {getScheduleTypeBadge(schedule.type)}
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-500">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {schedule.location}
                          </div>
                          {schedule.description && (
                            <p className="text-sm text-gray-500 mt-2">{schedule.description}</p>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500">Attendees:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {schedule.attendees.map(attendeeId => {
                              const person = people.find(p => p.id === attendeeId);
                              return (
                                <span key={attendeeId} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                  {person?.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ClipboardList className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming schedules</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new schedule.</p>
                    <div className="mt-4">
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="btn-primary-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Calendar</h2>
            <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-16 h-16 text-gray-400" />
              <p className="ml-2 text-gray-500">Calendar view coming soon</p>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Attendance History</h2>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map(record => {
                      const person = people.find(p => p.id === record.personId);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {person?.photo ? (
                                  <img className="h-10 w-10 rounded-full" src={person.photo} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{person?.name}</div>
                                <div className="text-sm text-gray-500">{person?.classroom || person?.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {person?.type}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Record Attendance</h2>
                <button onClick={() => setShowAttendanceModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      onChange={(e) => {
                        const selected = people.find(p => p.id === e.target.value);
                        setSelectedPerson(selected || null);
                      }}
                    >
                      <option value="">Select person</option>
                      {people.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.name} ({person.type})
                        </option>
                      ))}
                    </select>
                  </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    
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
                    onClick={() => setShowAttendanceModal(false)}
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
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Schedule</h2>
                <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-500">
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
                      {people.filter(p => p.type !== 'child').map(person => (
                        <div key={person.id} className="flex items-center">
                          <input
                            id={`attendee-${person.id}`}
                            name="attendees[]"
                            type="checkbox"
                            className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                          />
                          <label htmlFor={`attendee-${person.id}`} className="ml-2 block text-sm text-gray-900">
                            {person.name} ({person.type})
                          </label>
                        </div>
                      ))}
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
                    onClick={() => setShowScheduleModal(false)}
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