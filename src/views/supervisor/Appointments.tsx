import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, User, Eye, Phone, Filter, RefreshCw, X, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import meetingService from '../../services/meetingService';
import type { Meeting, CreateMeetingData, UpdateMeetingData } from '../../services/meetingService';

const Appointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [isEditMode] = useState(false);
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
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseModalText, setResponseModalText] = useState('');
  const [responseMeetingId, setResponseMeetingId] = useState<number | null>(null);

  // Mock child data for demo purposes (in real app, this would come from child service)
  const mockChildren = [
    { child_id: 1, name: 'Damsara Perera', parent_name: 'Malith Perera' },
    { child_id: 2, name: 'Mohomad Ahmed', parent_name: 'Farshad Ahmed' },
    { child_id: 3, name: 'Silva Silva', parent_name: 'Chathumini Silva' },
    { child_id: 4, name: 'Lakshmi Fernando', parent_name: 'Priya Fernando' }
  ];

  // Stats calculation based on status field
  const stats = {
    total: meetings.length,
    confirmed: meetings.filter(m => m.status === 'confirmed').length,
    pending: meetings.filter(m => m.status === 'pending').length,
    cancelled: meetings.filter(m => m.status === 'cancelled').length
  };

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get only supervisor meetings
      const data = await meetingService.getMeetingsByRecipient('supervisor');
      setMeetings(data);
    } catch (error: unknown) {
      console.error('Error fetching supervisor meetings:', error);
      toast.error('Failed to load supervisor meetings');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Fetch meetings from database (only supervisor meetings)
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Handle URL parameter for auto-opening meeting detail
  useEffect(() => {
    const meetingId = searchParams.get('meeting_id');
    if (meetingId && meetings.length > 0) {
      const meeting = meetings.find(m => m.meeting_id === parseInt(meetingId));
      if (meeting) {
        // Open the view modal directly
        setIsViewModalOpen(true);
        setCurrentMeeting(meeting);
        // Fetch full details
        fetchMeetingDetails(meeting.meeting_id);
        // Remove the parameter from URL after opening
        setSearchParams({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, meetings]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() && statusFilter === 'All Status') {
      fetchMeetings();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const searchParams: {
        searchTerm?: string;
        response?: string;
      } = {};
      if (searchTerm.trim()) searchParams.searchTerm = searchTerm;
      if (statusFilter !== 'All Status') searchParams.response = statusFilter;
      
      // Search only supervisor meetings
      const data = await meetingService.searchMeetings(searchParams);
      setMeetings(data);
    } catch (error: unknown) {
      console.error('Error searching supervisor meetings:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, fetchMeetings]);

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
  }, [handleSearch, searchTerm, statusFilter, isSearching]);

  // Handle input changes for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  

  // Fetch meeting details from database
  const fetchMeetingDetails = async (meetingId: number) => {
    setIsViewLoading(true);
    try {
      const fullMeetingData = await meetingService.getMeetingById(meetingId);
      setCurrentMeeting(fullMeetingData);
      toast.success('Meeting details loaded successfully');
    } catch (error: unknown) {
      console.error('Error fetching meeting details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load meeting details';
      toast.error(errorMessage);
    } finally {
      setIsViewLoading(false);
    }
  };

  // Open view modal for meeting details and fetch real data
  const openViewModal = async (meeting: Meeting) => {
    setIsViewModalOpen(true);
    setCurrentMeeting(meeting); // Set initial data to avoid blank modal
    await fetchMeetingDetails(meeting.meeting_id);
  };

  // Refresh meeting details
  const refreshMeetingDetails = async () => {
    if (currentMeeting) {
      await fetchMeetingDetails(currentMeeting.meeting_id);
    }
  };

  // Open delete confirmation modal (currently disabled)
  // const openDeleteModal = (meeting: Meeting) => {
  //   setIsDeleteModalOpen(true);
  //   setCurrentMeeting(meeting);
  // };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setIsResponseModalOpen(false);
    setCurrentMeeting(null);
    setResponseModalText('');
    setResponseMeetingId(null);
  };

  // Open response modal
  const openResponseModal = (meeting: Meeting) => {
    if (meeting.status !== 'confirmed' && meeting.status !== 'cancelled') {
      toast.warning('Can only add notes to Confirmed or Cancelled meetings');
      return;
    }
    setIsResponseModalOpen(true);
    setCurrentMeeting(meeting);
    setResponseMeetingId(meeting.meeting_id);
    setResponseModalText(meeting.response || '');
  };

  // Save/Update response
  const handleSaveResponse = async () => {
    if (!responseModalText.trim()) {
      toast.error('Please enter a response or note');
      return;
    }

    if (responseMeetingId === null) return;

    try {
      const updatedMeeting = await meetingService.updateMeetingResponse(responseMeetingId, responseModalText.trim());
      
      setMeetings(meetings.map(meeting => 
        meeting.meeting_id === responseMeetingId
          ? updatedMeeting
          : meeting
      ));

      // Update current meeting if it's the one being edited
      if (currentMeeting && currentMeeting.meeting_id === responseMeetingId) {
        setCurrentMeeting(updatedMeeting);
      }

      toast.success('Response updated successfully!');
      closeModal();
    } catch (error: unknown) {
      console.error('Error saving response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save response';
      toast.error(errorMessage);
    }
  };

  // Delete response
  const handleDeleteResponse = async () => {
    if (responseMeetingId === null) return;

    try {
      // Set empty response
      const updatedMeeting = await meetingService.updateMeetingResponse(responseMeetingId, '');
      
      setMeetings(meetings.map(meeting => 
        meeting.meeting_id === responseMeetingId
          ? updatedMeeting
          : meeting
      ));

      // Update current meeting if it's the one being edited
      if (currentMeeting && currentMeeting.meeting_id === responseMeetingId) {
        setCurrentMeeting(updatedMeeting);
      }

      toast.success('Response deleted successfully!');
      closeModal();
    } catch (error: unknown) {
      console.error('Error deleting response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete response';
      toast.error(errorMessage);
    }
  };

  // Update meeting status
  const updateMeetingStatus = async (meetingId: number, newStatus: 'confirmed' | 'cancelled') => {
    console.log('=== FRONTEND: updateMeetingStatus ===');
    console.log('Meeting ID:', meetingId);
    console.log('New Status:', newStatus);
    
    try {
      const updatedMeeting = await meetingService.updateMeetingStatus(meetingId, newStatus);
      console.log('Updated meeting received:', updatedMeeting);
      
      setMeetings(meetings.map(meeting => 
        meeting.meeting_id === meetingId ? updatedMeeting : meeting
      ));

      // Update current meeting if it's the one being viewed
      if (currentMeeting && currentMeeting.meeting_id === meetingId) {
        console.log('Updating current meeting in view modal');
        setCurrentMeeting(updatedMeeting);
      }

      toast.success(`Meeting ${newStatus} successfully!`);
      console.log('Status update completed successfully');
    } catch (error: unknown) {
      console.error('Error updating status:', error);
      const errorMessage = error instanceof Error ? error.message : `Failed to update status to ${newStatus}`;
      toast.error(errorMessage);
    }
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
        toast.success('Supervisor meeting updated successfully!');
      } else {
        // Only create supervisor meetings
        result = await meetingService.createMeeting(formData);
        setMeetings([result, ...meetings]);
        toast.success('Supervisor meeting scheduled successfully!');
      }
      closeModal();
    } catch (error: unknown) {
      console.error('Error submitting meeting:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    }
  };

  // Delete meeting
  const deleteMeeting = async () => {
    if (!currentMeeting) return;
    try {
      await meetingService.deleteMeeting(currentMeeting.meeting_id);
      setMeetings(meetings.filter(m => m.meeting_id !== currentMeeting.meeting_id));
      toast.success('Supervisor meeting deleted successfully!');
      closeModal();
    } catch (error: unknown) {
      console.error('Error deleting meeting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete meeting';
      toast.error(errorMessage);
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
            Supervisor Appointments
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
              placeholder="Search supervisor appointments by child name, parent name, or reason..."
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
                title="Filter by status"
                aria-label="Filter meetings by status"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {meetings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Parent & Child
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[23%]">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Response/Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting.meeting_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start">
                        <User className="flex-shrink-0 h-8 w-8 text-indigo-600 mt-1" />
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 break-words mb-1">
                            {meeting.parent_name}
                          </div>
                          <div className="text-sm text-gray-500 break-words">
                            {meeting.child_name} ({meeting.child_age} years)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm text-gray-900">
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{meeting.meeting_time}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm text-gray-900 break-words leading-relaxed">
                        {meeting.reason}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        meeting.status === 'confirmed'
                          ? 'bg-green-100 text-green-800' 
                          : meeting.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {meeting.status ? meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm text-gray-700 break-words max-w-xs">
                        {meeting.response ? meeting.response : <span className="text-gray-400 italic">No notes</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => openViewModal(meeting)}
                          className="text-blue-600 hover:text-blue-900 flex items-center text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        
                        {meeting.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateMeetingStatus(meeting.meeting_id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 flex items-center text-sm"
                              title="Confirm this meeting"
                            >
                              ✓ Confirm
                            </button>
                            <button
                              onClick={() => updateMeetingStatus(meeting.meeting_id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 flex items-center text-sm"
                              title="Cancel this meeting"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openResponseModal(meeting)}
                            className="text-purple-600 hover:text-purple-900 flex items-center text-sm"
                            title="Add/Edit Response"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Response
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {isSearching ? 'No matching supervisor appointments found' : 'No supervisor appointments found'}
            </p>
          </div>
        )}
      </div>

      {/* View Meeting Details Modal */}
      {isViewModalOpen && currentMeeting && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Supervisor Appointment Details
                  {isViewLoading && (
                    <span className="ml-2 text-sm text-blue-600">(Loading...)</span>
                  )}
                </h2>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={refreshMeetingDetails}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                    title="Refresh Data"
                    disabled={isViewLoading}
                  >
                    <RefreshCw className={`h-5 w-5 ${isViewLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                    title="Close"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {isViewLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  <span className="ml-3 text-gray-600">Loading appointment details...</span>
                </div>
              )}

              <div className={`space-y-6 ${isViewLoading ? 'opacity-50' : ''}`}>
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
                      <label className="block text-sm font-medium text-gray-600">Recipient</label>
                      <p className="text-sm text-gray-900 capitalize">{currentMeeting.recipient}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        currentMeeting.status === 'confirmed'
                          ? 'bg-green-100 text-green-800' 
                          : currentMeeting.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentMeeting.status ? currentMeeting.status.charAt(0).toUpperCase() + currentMeeting.status.slice(1) : 'Pending'}
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
                      <label className="block text-sm font-medium text-gray-600">Date</label>
                      <p className="text-sm text-gray-900">{new Date(currentMeeting.meeting_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Time</label>
                      <p className="text-sm text-gray-900">{currentMeeting.meeting_time}</p>
                    </div>
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Supervisor Appointment (Reason Only)' : 'Schedule New Supervisor Appointment'}
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
                          title="Select a child"
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
                          title="Select recipient"
                        >
                          <option value="supervisor">Supervisor</option>
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
                        title="Current appointment date (read-only)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Time</label>
                      <input
                        type="text"
                        value={currentMeeting?.meeting_time || ''}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                        readOnly
                        title="Current appointment time (read-only)"
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                Are you sure you want to delete the supervisor appointment with <span className="font-semibold">{currentMeeting?.parent_name}</span>? This action cannot be undone.
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

      {/* Response Modal - CRUD for response/notes */}
      {isResponseModalOpen && currentMeeting && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Add/Edit Response & Notes</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Meeting Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Meeting Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Parent</label>
                    <p className="text-sm font-medium text-gray-900">{currentMeeting.parent_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Child</label>
                    <p className="text-sm font-medium text-gray-900">{currentMeeting.child_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Date & Time</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(currentMeeting.meeting_date).toLocaleDateString()} at {currentMeeting.meeting_time}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                      currentMeeting.status === 'confirmed'
                        ? 'bg-green-100 text-green-800' 
                        : currentMeeting.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentMeeting.status ? currentMeeting.status.charAt(0).toUpperCase() + currentMeeting.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Response/Notes Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Response & Notes *</label>
                <textarea
                  value={responseModalText}
                  onChange={(e) => setResponseModalText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Enter your response or notes for this meeting..."
                  title="Enter response or notes"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {responseModalText.length} characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200">
                <div>
                  {currentMeeting.response && (
                    <button
                      onClick={handleDeleteResponse}
                      className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-md flex items-center text-sm"
                      title="Delete Response"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Response
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveResponse}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Save Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;