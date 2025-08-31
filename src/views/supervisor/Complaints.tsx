import { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, User, Trash2, Filter, Plus, Eye, Edit, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import complaintService from '../../services/complaintService';
import type { Complaint, CreateComplaintData, UpdateComplaintData } from '../../services/complaintService';

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [recipientFilter, setRecipientFilter] = useState('All Recipients');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CreateComplaintData>({
    date: '',
    subject: '',
    recipient: 'supervisor',
    description: '',
    status: 'Pending',
    action: '',
    child_id: 0
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

  // Stats calculation based on status
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    solved: complaints.filter(c => c.status === 'Solved').length,
    closed: complaints.filter(c => c.status === 'Closed').length
  };

  // Fetch complaints from database
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm.trim() || statusFilter !== 'All Status' || recipientFilter !== 'All Recipients' || isSearching) {
        handleSearch();
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, statusFilter, recipientFilter]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      // For supervisor, get complaints where recipient is 'supervisor'
      console.log('Fetching complaints for supervisor...');
      const data = await complaintService.getComplaintsByRecipient('supervisor');
      console.log('Fetched complaints:', data);
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Search complaints
  const handleSearch = async () => {
    if (!searchTerm.trim() && statusFilter === 'All Status' && recipientFilter === 'All Recipients') {
      fetchComplaints();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const searchParams: any = {};
      if (searchTerm.trim()) searchParams.searchTerm = searchTerm;
      if (statusFilter !== 'All Status') searchParams.status = statusFilter;
      if (recipientFilter !== 'All Recipients') searchParams.recipient = recipientFilter;

      // Always filter for supervisor complaints
      searchParams.recipient = 'supervisor';

      console.log('Searching complaints with params:', searchParams);
      const data = await complaintService.searchComplaints(searchParams);
      setComplaints(data);
    } catch (error) {
      console.error('Error searching complaints:', error);
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

  // Open modal for adding new complaint
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setCurrentComplaint(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      subject: '',
      recipient: 'supervisor',
      description: '',
      status: 'Pending',
      action: '',
      child_id: 0
    });
  };

  // Open modal for editing complaint
  const openEditModal = (complaint: Complaint) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentComplaint(complaint);
    setFormData({
      date: complaint.date,
      subject: complaint.subject,
      recipient: complaint.recipient,
      description: complaint.description,
      status: complaint.status,
      action: complaint.action || '',
      child_id: complaint.child_id
    });
  };

  // Open view modal for complaint details
  const openViewModal = (complaint: Complaint) => {
    setIsViewModalOpen(true);
    setCurrentComplaint(complaint);
  };

  // Open delete confirmation modal
  const openDeleteModal = (complaint: Complaint) => {
    setIsDeleteModalOpen(true);
    setCurrentComplaint(complaint);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentComplaint(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result: Complaint;
      if (isEditMode && currentComplaint) {
        const updateData: UpdateComplaintData = {
          date: formData.date,
          subject: formData.subject,
          recipient: formData.recipient,
          description: formData.description,
          status: formData.status,
          action: formData.action
        };
        result = await complaintService.updateComplaint(currentComplaint.complaint_id, updateData);
        setComplaints(complaints.map(c => c.complaint_id === result.complaint_id ? result : c));
        toast.success('Complaint updated successfully!');
      } else {
        result = await complaintService.createComplaint(formData);
        setComplaints([result, ...complaints]);
        toast.success('Complaint created successfully!');
      }
      closeModal();
    } catch (error: any) {
      console.error('Error saving complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to save complaint');
    }
  };

  // Delete complaint
  const deleteComplaint = async () => {
    if (!currentComplaint) return;

    try {
      await complaintService.deleteComplaint(currentComplaint.complaint_id);
      setComplaints(complaints.filter(c => c.complaint_id !== currentComplaint.complaint_id));
      toast.success('Complaint deleted successfully!');
      closeModal();
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
    }
  };

  // // Update complaint status
  // const updateStatus = async (complaintId: number, newStatus: string) => {
  //   try {
  //     const updatedComplaint = await complaintService.updateComplaintStatus(complaintId, newStatus);
  //     setComplaints(complaints.map(c => c.complaint_id === complaintId ? updatedComplaint : c));
  //     toast.success(`Complaint status updated to ${newStatus}!`);
  //   } catch (error: any) {
  //     console.error('Error updating complaint status:', error);
  //     toast.error(error.response?.data?.message || 'Failed to update complaint status');
  //   }
  // };

  // Update complaint action
  const updateAction = async (complaintId: number, newAction: string) => {
    try {
      const updatedComplaint = await complaintService.updateComplaintAction(complaintId, newAction);
      setComplaints(complaints.map(c => c.complaint_id === complaintId ? updatedComplaint : c));
      toast.success('Complaint action updated successfully!');
    } catch (error: any) {
      console.error('Error updating complaint action:', error);
      toast.error(error.response?.data?.message || 'Failed to update complaint action');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setRecipientFilter('All Recipients');
    fetchComplaints();
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
            Complaints Management
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
              placeholder="Search complaints by subject, description, child name, or parent name..."
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
                <option value="In Progress">In Progress</option>
                <option value="Solved">Solved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              >
                <option value="All Recipients">All Recipients</option>
                <option value="supervisor">Supervisor</option>
                <option value="teacher">Teacher</option>
              </select>
            </div> */}

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Total Complaints</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Solved</h3>
          <p className="text-2xl font-bold text-green-600">{stats.solved}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Closed</h3>
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child & Parent</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.complaint_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <AlertCircle className="flex-shrink-0 h-8 w-8 text-red-600" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{complaint.subject}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate" title={complaint.description}>
                            {complaint.description}
                          </div>
                          <div className="text-sm text-gray-400">{new Date(complaint.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Parent : {complaint.parent_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Child : {complaint.child_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        complaint.recipient === 'supervisor' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {complaint.recipient.charAt(0).toUpperCase() + complaint.recipient.slice(1)}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            complaint.status === 'Solved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openViewModal(complaint)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>

                      {/* <button
                        onClick={() => openEditModal(complaint)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        title="Edit Complaint"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                       */}
                      <button
                        onClick={() => openDeleteModal(complaint)}
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
              {isSearching ? 'No matching complaints found' : 'No complaints found'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Complaint' : 'New Complaint'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div> */}

                  {/* <div>
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
                  </div> */}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    placeholder="Enter complaint subject"
                  />
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    placeholder="Enter detailed description of the complaint"
                  />
                </div> */}

                {!isEditMode && (
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
                )}

                {isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Solved">Solved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                      <textarea
                        name="action"
                        value={formData.action}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter action taken or response"
                      />
                    </div>
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
                    {isEditMode ? 'Update Complaint' : 'Create Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Complaint Details Modal */}
      {isViewModalOpen && currentComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Complaint Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
                    <p><strong>Subject:</strong> {currentComplaint.subject}</p>
                    <p><strong>Date:</strong> {new Date(currentComplaint.date).toLocaleDateString()}</p>
                    <p><strong>Recipient:</strong> {currentComplaint.recipient.charAt(0).toUpperCase() + currentComplaint.recipient.slice(1)}</p>
                    <p><strong>Status:</strong> {currentComplaint.status}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Child & Parent</h3>
                    <p><strong>Child:</strong> {currentComplaint.child_name} ({currentComplaint.child_age} years)</p>
                    <p><strong>Parent:</strong> {currentComplaint.parent_name}</p>
                    <p><strong>Email:</strong> {currentComplaint.parent_email}</p>
                    <p><strong>Phone:</strong> {currentComplaint.parent_phone}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-700">{currentComplaint.description}</p>
                </div>

                {currentComplaint.action && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Action Taken</h3>
                    <p className="text-gray-700">{currentComplaint.action}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      openEditModal(currentComplaint);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Status and Action
                  </button>
                </div>
              </div>
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
                Are you sure you want to delete the complaint "{currentComplaint?.subject}"? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteComplaint}
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

export default Complaints;