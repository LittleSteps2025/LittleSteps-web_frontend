import { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, Trash2, Filter, ChevronUp, ChevronDown, CheckCircle, X, FileText, Download, MessageSquare, Clock 
} from 'lucide-react';

interface Complaint {
  complaint_id: string;
  date: string;
  subject: string;
  recipient: string;
  description: string;
  status: 'Pending' | 'Investigating' | 'Solved';
  action: string | null;
  child_id: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_ENDPOINTS = {
  COMPLAINTS: `${API_BASE_URL}/api/complaints`,
  CHILDREN: `${API_BASE_URL}/api/children`,
} as const;

const ComplaintsManagement = () => {
  // State for complaints data and loading
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Helper: read stored token from localStorage
  const getStoredToken = (): string | null => {
    return localStorage.getItem('token');
  };

  // Fetch complaints from API
  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching complaints from:', API_ENDPOINTS.COMPLAINTS);
      const response = await fetch(API_ENDPOINTS.COMPLAINTS, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view complaints.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check the server configuration.');
        } else {
          throw new Error(errorData?.message || `Failed to fetch complaints (${response.status})`);
        }
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && Array.isArray(data.data)) {
        setComplaints(data.data);
        console.log(`Successfully loaded ${data.data.length} complaints`);
      } else {
        throw new Error(data.message || 'Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch complaints';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create new complaint
  const createComplaint = async (complaintData: Omit<Complaint, 'complaint_id'>) => {
    setLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.COMPLAINTS, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaintData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please log in again.');
        }
        throw new Error(errorData?.message || 'Failed to create complaint');
      }

      const data: ApiResponse<Complaint> = await response.json();
      if (data.success) {
        setComplaints(prev => [data.data, ...prev]);
        console.log('Complaint created successfully:', data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create complaint');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create complaint';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update complaint
  const updateComplaint = async (complaintId: string, updates: Partial<Complaint>) => {
    setLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.COMPLAINTS}/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please log in again.');
        }
        throw new Error(errorData?.message || 'Failed to update complaint');
      }

      const data: ApiResponse<Complaint> = await response.json();
      if (data.success) {
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.complaint_id === complaintId ? data.data : complaint
          )
        );
        console.log('Complaint updated successfully:', data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update complaint');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update complaint';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete complaint
  const deleteComplaint = async (complaintId: string) => {
    setLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.COMPLAINTS}/${complaintId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please log in again.');
        }
        throw new Error(errorData?.message || 'Failed to delete complaint');
      }

      const data = await response.json();
      if (data.success) {
        setComplaints(prev => 
          prev.filter(complaint => complaint.complaint_id !== complaintId)
        );
        console.log('Complaint deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete complaint');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete complaint';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Sort keys based on the Complaint interface
  const sortKeys = ['date', 'subject', 'recipient', 'status', 'action'] as const;
  type SortKey = typeof sortKeys[number];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ 
    key: 'date', 
    direction: 'desc' 
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Filter and sort complaints
  const filteredComplaints = complaints
    .filter(complaint => 
      (complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
       complaint.recipient.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeFilter === 'all' || complaint.status === activeFilter)
    )
    .sort((a, b) => {
      const key = sortConfig.key;
      const aValue = a[key];
      const bValue = b[key];

      if (String(aValue) < String(bValue)) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (String(aValue) > String(bValue)) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const indexOfLastComplaint = currentPage * itemsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - itemsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectComplaint = (complaintId: string) => {
    setSelectedComplaints(prev =>
      prev.includes(complaintId) 
        ? prev.filter(id => id !== complaintId) 
        : [...prev, complaintId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(currentComplaints.map(complaint => complaint.complaint_id));
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    const statusClasses: Record<Complaint['status'], string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Investigating: 'bg-blue-100 text-blue-800',
      Solved: 'bg-green-100 text-green-800'
    };
    const statusIcons: Record<Complaint['status'], React.ReactNode> = {
      Pending: <Clock className="w-4 h-4 mr-1" />,
      Investigating: <AlertCircle className="w-4 h-4 mr-1" />,
      Solved: <CheckCircle className="w-4 h-4 mr-1" />
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${statusClasses[status]}`}>
        {statusIcons[status]}
        {status}
      </span>
    );
  };

  const openDeleteModal = (complaint: Complaint) => {
    setCurrentComplaint(complaint);
    setShowDeleteModal(true);
  };

  const openResolveModal = (complaint: Complaint) => {
    setCurrentComplaint(complaint);
    setResolutionText(complaint.action || '');
    setShowResolveModal(true);
  };

  const handleDelete = async () => {
    if (!currentComplaint) return;
    
    try {
      await deleteComplaint(currentComplaint.complaint_id);
      setShowDeleteModal(false);
      setCurrentComplaint(null);
    } catch (err) {
      console.error('Failed to delete complaint:', err);
    }
  };

  const handleResolve = async () => {
    if (!currentComplaint) return;
    
    try {
      await updateComplaint(currentComplaint.complaint_id, {
        status: 'Solved',
        action: resolutionText
      });
      setShowResolveModal(false);
      setCurrentComplaint(null);
      setResolutionText('');
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting complaints as ${format}`);
    // Implement export logic here
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complaints Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading...' : `Total: ${complaints.length} complaint${complaints.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={fetchComplaints}
            disabled={loading}
            className="btn-outline"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button 
            onClick={() => setShowExportModal(true)} 
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button 
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              id="search-complaints"
              name="search-complaints"
              placeholder="Search complaints by description, subject, or recipient..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="dropdown relative">
              <button
                className="btn-outline flex items-center"
                onClick={() => setShowFilterDropdown((prev) => !prev)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {activeFilter === 'all' ? 'All Status' : activeFilter}
                {showFilterDropdown ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'all' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('all'); setShowFilterDropdown(false); }}
                    >
                      All Complaints
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'Pending' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('Pending'); setShowFilterDropdown(false); }}
                    >
                      Pending
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'Investigating' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('Investigating'); setShowFilterDropdown(false); }}
                    >
                      Investigating
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'Solved' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('Solved'); setShowFilterDropdown(false); }}
                    >
                      Solved
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {selectedComplaints.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                  {selectedComplaints.length} selected
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    id="select-all-complaints"
                    name="select-all-complaints"
                    checked={selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                  />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('subject')}
                >
                  <div className="flex items-center">
                    Subject
                    {sortConfig.key === 'subject' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6339C0]"></div>
                      <p className="mt-4 text-sm text-gray-500">Loading complaints...</p>
                    </div>
                  </td>
                </tr>
              ) : currentComplaints.length > 0 ? (
                currentComplaints.map((complaint) => (
                  <tr key={complaint.complaint_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedComplaints.includes(complaint.complaint_id)}
                        onChange={() => toggleSelectComplaint(complaint.complaint_id)}
                        className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {complaint.recipient}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={complaint.description}>
                        {complaint.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={complaint.action || ''}>
                        {complaint.action || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCurrentComplaint(complaint);
                            document.getElementById('complaint-details')?.classList.remove('hidden');
                          }}
                          className="text-[#6339C0] hover:text-[#7e57ff] transition-colors"
                          title="View details"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        {complaint.status !== 'Solved' && (
                          <button
                            onClick={() => openResolveModal(complaint)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Resolve complaint"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => openDeleteModal(complaint)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete complaint"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="text-sm font-medium">No complaints found</p>
                      <p className="text-xs mt-1">
                        {searchTerm || activeFilter !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'No complaints have been submitted yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Complaint Details Panel */}
        <div id="complaint-details" className="hidden border-t border-gray-200 bg-gray-50 p-6">
          {currentComplaint && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
                  <p className="text-sm text-gray-500">ID: {currentComplaint.complaint_id}</p>
                </div>
                <button 
                  onClick={() => document.getElementById('complaint-details')?.classList.add('hidden')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Subject</h4>
                  <p className="mt-1 text-sm text-gray-900">{currentComplaint.subject}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Recipient</h4>
                  <p className="mt-1 text-sm text-gray-900">{currentComplaint.recipient}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Description</h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{currentComplaint.description}</p>
              </div>
              
              {currentComplaint.action && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Action Taken</h4>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{currentComplaint.action}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <div className="mt-1">{getStatusBadge(currentComplaint.status)}</div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Date</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(currentComplaint.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                {currentComplaint.status !== 'Solved' && (
                  <button onClick={() => openResolveModal(currentComplaint)} className="btn-primary">
                    Resolve Complaint
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstComplaint + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastComplaint, filteredComplaints.length)}</span> of{' '}
                  <span className="font-medium">{filteredComplaints.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronUp className="h-5 w-5 rotate-[-90deg]" />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === idx + 1
                          ? 'z-10 bg-[#6339C0] border-[#6339C0] text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 rotate-[-90deg]" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
                <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to delete this complaint?
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">This action cannot be undone</h3>
                      <p className="mt-2 text-sm text-red-700">
                        All records of this complaint will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Complaint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Complaint Modal */}
      {showResolveModal && currentComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentComplaint.status === 'Solved' ? 'Update Resolution' : 'Resolve Complaint'}
                </h2>
                <button onClick={() => setShowResolveModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Complaint Details</h3>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Subject:</span> {currentComplaint.subject}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Recipient:</span> {currentComplaint.recipient}
                  </p>
                  <p className="mt-2 text-sm text-gray-900 whitespace-pre-line">
                    {currentComplaint.description}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Details *
                  </label>
                  <textarea
                    id="resolution"
                    name="resolution"
                    rows={6}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                    placeholder="Describe how the complaint was resolved..."
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResolve}
                  className="btn-primary disabled:opacity-50"
                  disabled={loading || !resolutionText.trim()}
                >
                  {loading ? 'Resolving...' : currentComplaint.status === 'Solved' ? 'Update Resolution' : 'Resolve Complaint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Export Complaints</h2>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Select the format you want to export the complaints data in:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#6339C0] hover:bg-[#f3eeff] transition-colors"
                  >
                    <FileText className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="font-medium">CSV Format</span>
                    <span className="text-xs text-gray-500 mt-1">Excel, Numbers, etc.</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#6339C0] hover:bg-[#f3eeff] transition-colors"
                  >
                    <FileText className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="font-medium">PDF Format</span>
                    <span className="text-xs text-gray-500 mt-1">Adobe Reader, etc.</span>
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">Include all complaint details</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                      checked={selectedComplaints.length > 0}
                      disabled={selectedComplaints.length === 0}
                    />
                    <span className={`ml-2 text-sm ${selectedComplaints.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      Export only selected complaints ({selectedComplaints.length})
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">Include resolution details</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="btn-primary"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;