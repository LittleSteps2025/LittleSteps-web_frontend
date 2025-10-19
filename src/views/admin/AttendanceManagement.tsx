import { useState, useEffect } from 'react';
import {
  UserCheck, UserX, CheckCircle, XCircle,
  Download, ArrowLeft, ArrowRight,
  Clock as BarChart2, Baby, FileText, RefreshCw
} from 'lucide-react';

// Types
type Person = {
  id: string | number;
  name: string;
  type: 'supervisor' | 'teacher' | 'child';
  role?: string;
  classroom?: string;
  photo?: string;
  child_id?: number;
  user_id?: number;
};

type AttendanceRecord = {
  id: string | number;
  date: string;
  personId: string | number;
  status: 'present' | 'absent';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  attendance_id?: number;
  child_id?: number;
  check_in_time?: string;
  check_out_time?: string;
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalChildren: number;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_ENDPOINTS = {
  ATTENDANCE: `${API_BASE_URL}/api/admin/attendance`,
  CHILDREN: `${API_BASE_URL}/api/admin/children`,
  SCHEDULES: `${API_BASE_URL}/api/admin/schedules`,
  USERS: `${API_BASE_URL}/api/admin/users`,
} as const;

const AttendanceManagement = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [historyFilterDate, setHistoryFilterDate] = useState<string>('');

  // Data State
  const [people, setPeople] = useState<Person[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalPresent: 0,
    totalAbsent: 0,
    totalChildren: 0
  });

  // Fetch all children
  const fetchChildren = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CHILDREN, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Children endpoint not available');
        return;
      }

      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const childrenData: Person[] = data.data.map((child: any) => ({
          id: child.child_id || child.id,
          name: child.child_name || child.name || `${child.first_name} ${child.last_name}`,
          type: 'child' as const,
          classroom: child.classroom || child.group_name,
          photo: child.photo_url || child.photo,
          child_id: child.child_id
        }));
        setPeople(prev => [...prev.filter(p => p.type !== 'child'), ...childrenData]);
      }
    } catch (err) {
      console.error('Error fetching children:', err);
    }
  };

  // Fetch staff (teachers and supervisors)
  const fetchStaff = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Users endpoint not available');
        return;
      }

      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const staffData: Person[] = data.data
          .filter((user: any) => user.role === 'teacher' || user.role === 'supervisor')
          .map((user: any) => ({
            id: user.user_id || user.id,
            name: user.full_name || user.name || `${user.first_name} ${user.last_name}`,
            type: user.role as 'teacher' | 'supervisor',
            role: user.role,
            photo: user.photo_url || user.avatar,
            user_id: user.user_id
          }));
        setPeople(prev => [...prev.filter(p => p.type === 'child'), ...staffData]);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // Fetch attendance records
  const fetchAttendance = async (date: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ATTENDANCE}?date=${date}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Attendance endpoint not available');
        setAttendanceRecords([]);
        return;
      }

      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const records: AttendanceRecord[] = data.data.map((record: any) => ({
          id: record.attendance_id || record.id,
          date: record.date || record.attendance_date,
          personId: record.child_id || record.user_id,
          status: record.status,
          checkIn: record.check_in_time || record.checkIn,
          checkOut: record.check_out_time || record.checkOut,
          notes: record.notes,
          attendance_id: record.attendance_id,
          child_id: record.child_id
        }));
        setAttendanceRecords(records);

        // Calculate stats
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        setStats({
          totalPresent: present,
          totalAbsent: absent,
          totalChildren: present + absent
        });
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendanceRecords([]);
    }
  };

  // Fetch attendance history
  const fetchAttendanceHistory = async (filterDate?: string) => {
    try {
      let url = `${API_ENDPOINTS.ATTENDANCE}/history?limit=50`;
      if (filterDate) {
        url += `&date=${filterDate}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Attendance history endpoint not available');
        return;
      }

      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const records: AttendanceRecord[] = data.data.map((record: any) => ({
          id: record.attendance_id || record.id,
          date: record.date || record.attendance_date,
          personId: record.child_id || record.user_id,
          status: record.status,
          checkIn: record.check_in_time || record.checkIn,
          checkOut: record.check_out_time || record.checkOut,
          notes: record.notes,
          attendance_id: record.attendance_id,
          child_id: record.child_id
        }));
        
        if (activeTab === 'history') {
          setAttendanceRecords(records);
        }
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.allSettled([
        fetchChildren(),
        fetchStaff(),
        fetchAttendance(currentDate)
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load some data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload attendance when date changes
  useEffect(() => {
    if (activeTab === 'summary') {
      fetchAttendance(currentDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, activeTab]);

  // Load history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchAttendanceHistory(historyFilterDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Reload history when filter date changes
  useEffect(() => {
    if (activeTab === 'history' && historyFilterDate !== '') {
      fetchAttendanceHistory(historyFilterDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyFilterDate]);

  // Get records for current date
  const currentRecords = attendanceRecords.filter(record => record.date === currentDate);
  
  // Get person details for each record
  const attendanceWithDetails = currentRecords.map(record => {
    const person = people.find(p => String(p.id) === String(record.personId));
    return { ...record, person };
  });

  // Group by type
  const children = attendanceWithDetails.filter(r => r.person?.type === 'child');

  // Counts
  const presentCount = stats.totalPresent;
  const absentCount = stats.totalAbsent;

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
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
              Attendance Management
            </span>
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="bg-[#6339C0] text-white py-2 px-4 rounded-lg hover:bg-[#5227a3] transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !refreshing ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading attendance data...</p>
            </div>
          </div>
        ) : (
          <>
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

              {/* Today's Attendance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center">
                  <Baby className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium text-indigo-800">Today's Attendance</h3>
                </div>
                <div className="p-4">
                  {children.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {children.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{record.person?.name || '-'}</p>
                            <p className="text-xs text-gray-500 mt-1">{record.person?.classroom ? `${record.person.classroom} Classroom` : '-'}</p>
                            <div className="mt-3">
                              {getStatusBadge(record.status)}
                            </div>
                            {record.checkIn && (
                              <p className="text-xs text-gray-500 mt-2">
                                <span className="text-green-600">{record.checkIn}</span> - 
                                <span className="text-red-600"> {record.checkOut || '--:--'}</span>
                              </p>
                            )}
                            {record.notes && (
                              <p className="text-xs text-gray-500 mt-2 italic">"{record.notes}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records for today</h3>
                      <p className="mt-1 text-sm text-gray-500">Attendance data will appear here when available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Attendance History</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <label htmlFor="history-date-filter" className="text-sm font-medium text-gray-700">
                    Filter by Date:
                  </label>
                  <input
                    id="history-date-filter"
                    type="date"
                    value={historyFilterDate}
                    onChange={(e) => setHistoryFilterDate(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {historyFilterDate && (
                    <button
                      onClick={() => setHistoryFilterDate('')}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
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
                    {attendanceRecords.length > 0 ? (
                      attendanceRecords.map(record => {
                        const person = people.find(p => p.id === record.personId);
                        return (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{person?.name || '-'}</div>
                              <div className="text-xs text-gray-500 mt-1">{person?.classroom || person?.role || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {person?.type || '-'}
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
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-gray-500">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-900">No attendance records found</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {historyFilterDate 
                                ? 'Try selecting a different date or clear the filter.' 
                                : 'Attendance history will appear here when available.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </>
      )}
      </main>
    </div>
  );
};

export default AttendanceManagement;