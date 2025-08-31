import { useState, useEffect } from 'react';
import { Calendar, Search, Plus, User, Check, X, Trash2, Eye, Clock, Phone, MapPin, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import meetingService from '../../services/meetingService';
import type { Meeting, CreateMeetingData, UpdateMeetingData } from '../../services/meetingService';

const Appointments = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    meeting_date: '',
    meeting_time: ''
  });
  const [formData, setFormData] = useState<CreateMeetingData>({
    child_id: 0,
    recipient: 'supervisor',
    meeting_date: '',
    meeting_time: '',
    reason: '',
    response: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Mock child data for demo purposes (in real app, this would come from child service)
  const mockChildren = [
    { child_id: 1, name: 'Damsara Perera', parent_name: 'Malith Perera' },
    { child_id: 2, name: 'Mohomad Ahmed', parent_name: 'Farshad Ahmed' },
    { child_id: 3, name: 'Silva Silva', parent_name: 'Chathumini Silva' },
    { child_id: 4, name: 'Lakshmi Fernando', parent_name: 'Priya Fernando' }
  ];

  // Stats calculation based on response status
  const stats = {
    total: meetings.length,
    confirmed: meetings.filter(m => m.response && m.response.toLowerCase().includes('confirmed')).length,
    pending: meetings.filter(m => !m.response || m.response.toLowerCase().includes('pending')).length,
    cancelled: meetings.filter(m => m.response && m.response.toLowerCase().includes('cancelled')).length
  };

  // Fetch meetings from database
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm.trim() || statusFilter !== 'All Status' || isSearching) {
        handleSearch();
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, statusFilter]);

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      // For supervisor, get meetings where recipient is 'supervisor'
      const data = await meetingService.getMeetingsByRecipient('supervisor');
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Search meetings
  const handleSearch = async () => {
    if (!searchTerm.trim() && statusFilter === 'All Status') {
      fetchMeetings();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const searchParams: any = {};
      if (searchTerm.trim()) searchParams.searchTerm = searchTerm;
      if (statusFilter !== 'All Status') searchParams.response = statusFilter;
      
      const data = await meetingService.searchMeetings(searchParams);
      setMeetings(data);
    } catch (error) {
      console.error('Error searching meetings:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

 

  // Open modal for editing meeting (supervisor can only edit date, time, and reason)
  const openEditModal = (meeting: Meeting) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentMeeting(meeting);
    setFormData({
      child_id: meeting.child_id,
      recipient: meeting.recipient,
      meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time,
      reason: meeting.reason,
      response: meeting.response || ''
    });
  };

  // Open modal for rescheduling meeting (supervisor can only edit date and time)
  const openRescheduleModal = (meeting: Meeting) => {
    setIsRescheduleModalOpen(true);
    setCurrentMeeting(meeting);
    setRescheduleData({
      meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time
    });
  };

  // Open view modal for meeting details
  const openViewModal = (meeting: Meeting) => {
    setIsViewModalOpen(true);
    setCurrentMeeting(meeting);
  };

  // Open delete confirmation modal
  const openDeleteModal = (meeting: Meeting) => {
    setIsDeleteModalOpen(true);
    setCurrentMeeting(meeting);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setIsRescheduleModalOpen(false);
    setCurrentMeeting(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result: Meeting;
      if (isEditMode && currentMeeting) {
        // Supervisor can only update date, time, and reason
        const updateData: UpdateMeetingData = {
          meeting_date: formData.meeting_date,
          meeting_time: formData.meeting_time,
          reason: formData.reason,
          response: formData.response
        };
        result = await meetingService.updateMeeting(currentMeeting.meeting_id, updateData);
        setMeetings(meetings.map(m => m.meeting_id === result.meeting_id ? result : m));
        toast.success('Meeting updated successfully!');
      } else {
        result = await meetingService.createMeeting(formData);
        setMeetings([result, ...meetings]);
        toast.success('Meeting scheduled successfully!');
      }
      closeModal();
    } catch (error: any) {
      console.error('Error submitting meeting:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  // Delete meeting
  const deleteMeeting = async () => {
    if (!currentMeeting) return;
    try {
      await meetingService.deleteMeeting(currentMeeting.meeting_id);
      setMeetings(meetings.filter(m => m.meeting_id !== currentMeeting.meeting_id));
      toast.success('Meeting deleted successfully!');
      closeModal();
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
    }
  };

  // Update meeting response
  const updateResponse = async (meetingId: number, newResponse: string) => {
    try {
      const updatedMeeting = await meetingService.updateMeetingResponse(meetingId, newResponse);
      setMeetings(meetings.map(m => m.meeting_id === meetingId ? updatedMeeting : m));
      toast.success(`Meeting response updated successfully!`);
    } catch (error: any) {
      console.error('Error updating meeting response:', error);
      toast.error(error.response?.data?.message || `Failed to update meeting response`);
    }
  };

  // Handle rescheduling meeting (only date and time)
  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMeeting) return;
    
    try {
      const updateData: UpdateMeetingData = {
        meeting_date: rescheduleData.meeting_date,
        meeting_time: rescheduleData.meeting_time,
        reason: currentMeeting.reason, // Keep existing reason
        response: currentMeeting.response // Keep existing response
      };
      
      const result = await meetingService.updateMeeting(currentMeeting.meeting_id, updateData);
      setMeetings(meetings.map(m => m.meeting_id === result.meeting_id ? result : m));
      toast.success('Meeting rescheduled successfully!');
      closeModal();
    } catch (error: any) {
      console.error('Error rescheduling meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to reschedule meeting');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    fetchMeetings();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Appointments
          </span>
        </h1>
        
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments by child name, parent name, or reason..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Total Appointments</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Confirmed</h3>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Cancelled</h3>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {meetings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent & Child</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting.meeting_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{meeting.parent_name}</div>
                          <div className="text-sm text-gray-500">{meeting.child_name} ({meeting.child_age} years)</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{meeting.meeting_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={meeting.reason}>
                        {meeting.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        meeting.response && meeting.response.toLowerCase().includes('confirmed')
                          ? 'bg-green-100 text-green-800' 
                          : meeting.response && meeting.response.toLowerCase().includes('cancelled')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {meeting.response ? meeting.response : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openViewModal(meeting)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      
                      {/* Confirm/Cancel buttons for pending meetings */}
                      {(!meeting.response || meeting.response.toLowerCase().includes('pending')) && (
                        <>
                          <button
                            onClick={() => updateResponse(meeting.meeting_id, 'Confirmed')}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Confirm Meeting"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm
                          </button>
                          <button
                            onClick={() => updateResponse(meeting.meeting_id, 'Cancelled')}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Cancel Meeting"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {/* Reschedule button for all meetings */}
                        <button
                        onClick={() => openRescheduleModal(meeting)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        title="Reschedule Date & Time Only"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Reschedule
                        </button>
                      
                      <button
                        onClick={() => openDeleteModal(meeting)}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {isSearching ? 'No matching appointments found' : 'No appointments found'}
            </p>
            
          </div>
        )}
      </div>

      {/* View Meeting Details Modal */}
      {isViewModalOpen && currentMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Parent Name</label>
                      <p className="text-sm text-gray-900">{currentMeeting.parent_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Child Name</label>
                      <p className="text-sm text-gray-900">{currentMeeting.child_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Child Age</label>
                      <p className="text-sm text-gray-900">{currentMeeting.child_age} years</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Child Gender</label>
                      <p className="text-sm text-gray-900">{currentMeeting.child_gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Date</label>
                      <p className="text-sm text-gray-900">{new Date(currentMeeting.meeting_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Time</label>
                      <p className="text-sm text-gray-900">{currentMeeting.meeting_time}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Recipient</label>
                      <p className="text-sm text-gray-900 capitalize">{currentMeeting.recipient}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        currentMeeting.response && currentMeeting.response.toLowerCase().includes('confirmed')
                          ? 'bg-green-100 text-green-800' 
                          : currentMeeting.response && currentMeeting.response.toLowerCase().includes('cancelled')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentMeeting.response ? currentMeeting.response : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-sm text-gray-900">{currentMeeting.parent_phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900">{currentMeeting.parent_email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Address</label>
                      <p className="text-sm text-gray-900">{currentMeeting.parent_address}</p>
                    </div>
                  </div>
                </div>

                {/* Meeting Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Meeting Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Reason</label>
                      <p className="text-sm text-gray-900">{currentMeeting.reason}</p>
                    </div>
                    {currentMeeting.response && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Response</label>
                        <p className="text-sm text-gray-900">{currentMeeting.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
               
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Appointment (Reason Only)' : 'Schedule New Appointment'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isEditMode && (
                  <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Child *</label>
                        <select
                          name="child_id"
                          value={formData.child_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                        >
                          <option value={0}>Select a child</option>
                          {mockChildren.map(child => (
                            <option key={child.child_id} value={child.child_id}>
                              {child.name} - {child.parent_name}
                            </option>
                          ))}
                        </select>
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient *</label>
                        <select
                          name="recipient"
                          value={formData.recipient}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                        >
                          <option value="supervisor">Supervisor</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </div>
                  </div>
                  </>
                )}

                {/* Editable fields for both new and edit modes */}
                {!isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                        name="meeting_date"
                        value={formData.meeting_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="Select date"
                      title="Select appointment date"
                    />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                        name="meeting_time"
                        value={formData.meeting_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="Select time"
                      title="Select appointment time"
                    />
                  </div>
                  </div>
                )}

                  {isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Date</label>
                      <input
                        type="text"
                        value={new Date(currentMeeting?.meeting_date || '').toLocaleDateString()}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Time</label>
                      <input
                        type="text"
                        value={currentMeeting?.meeting_time || ''}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                        readOnly
                      />
                    </div>
                    </div>
                  )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    placeholder="Enter the reason for the meeting"
                    title="Meeting reason"
                  />
                </div>

                {!isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response (Optional)</label>
                    <textarea
                      name="response"
                      value={formData.response}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add any initial response or notes"
                      title="Initial response or notes"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {isEditMode ? 'Update' : 'Schedule'} Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && currentMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Reschedule Meeting</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Parent:</strong> {currentMeeting.parent_name}<br />
                  <strong>Child:</strong> {currentMeeting.child_name}<br />
                  <strong>Current Date:</strong> {new Date(currentMeeting.meeting_date).toLocaleDateString()}<br />
                  <strong>Current Time:</strong> {currentMeeting.meeting_time}
                </p>
              </div>

              <form onSubmit={handleReschedule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date *</label>
                    <input
                      type="date"
                      name="meeting_date"
                      value={rescheduleData.meeting_date}
                      onChange={(e) => setRescheduleData({
                        ...rescheduleData,
                        meeting_date: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Time *</label>
                    <input
                      type="time"
                      name="meeting_time"
                      value={rescheduleData.meeting_time}
                      onChange={(e) => setRescheduleData({
                        ...rescheduleData,
                        meeting_time: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Reschedule Meeting
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500" title="Close">
                  <X className="w-6 h-6" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <p className="mb-6 text-gray-600">
                Are you sure you want to delete the appointment with <span className="font-semibold">{currentMeeting?.parent_name}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteMeeting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;