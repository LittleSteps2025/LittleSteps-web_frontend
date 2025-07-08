import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Clock, Edit, Trash2, X } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  status: 'Active' | 'Expired';
  recipients: 'All' | 'Teachers' | 'Parents';
};

// Mock data for announcements with timestamps
const mockAnnouncements: Announcement[] = [
  {
    id: 'announcement-001',
    title: 'Parent-Teacher Meeting',
    content: 'Monthly meeting scheduled for next week',
    date: '2025-07-10',
    createdAt: '2025-07-02T10:30:00',
    status: 'Active',
    recipients: 'All'
  },
  {
    id: 'announcement-002',
    title: 'School Holiday',
    content: 'School will be closed on July 15th',
    date: '2025-07-15',
    createdAt: '2025-07-01T14:20:00',
    status: 'Active',
    recipients: 'Parents'
  },
  {
    id: 'announcement-003',
    title: 'Field Trip',
    content: 'Permission slips due by Friday',
    date: '2025-06-30',
    createdAt: '2025-06-28T09:15:00',
    status: 'Expired',
    recipients: 'Teachers'
  }
];

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200" title="Close notification">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Mock API functions
const fetchMockAnnouncements = async (): Promise<Announcement[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockAnnouncements]);
    }, 500);
  });
};

const searchMockAnnouncements = async (term: string): Promise<Announcement[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!term.trim()) {
        resolve([...mockAnnouncements]);
        return;
      }
      const filtered = mockAnnouncements.filter(announcement => 
        announcement.title.toLowerCase().includes(term.toLowerCase()) ||
        announcement.content.toLowerCase().includes(term.toLowerCase()) ||
        announcement.date.includes(term) ||
        announcement.status.toLowerCase().includes(term.toLowerCase()) ||
        announcement.id.toLowerCase().includes(term.toLowerCase()) ||
        announcement.recipients.toLowerCase().includes(term.toLowerCase())
      );
      resolve(filtered);
    }, 300);
  });
};

const createMockAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newAnnouncement: Announcement = { 
        ...announcement, 
        id: `announcement-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        status: new Date(announcement.date) >= new Date() ? 'Active' : 'Expired'
      };
      mockAnnouncements.unshift(newAnnouncement);
      resolve(newAnnouncement);
    }, 500);
  });
};

const updateMockAnnouncement = async (announcement: Announcement): Promise<Announcement> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockAnnouncements.findIndex(a => a.id === announcement.id);
      if (index !== -1) {
        mockAnnouncements[index] = announcement;
      }
      resolve(announcement);
    }, 500);
  });
};

const deleteMockAnnouncement = async (id: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockAnnouncements.findIndex(a => a.id === id);
      if (index !== -1) {
        mockAnnouncements.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'status' | 'createdAt'>>({
    title: '',
    content: '',
    date: '',
    recipients: 'All'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Fetch announcements from mock API
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm.trim() || isSearching) {
        handleSearch();
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMockAnnouncements();
      setAnnouncements(data);
    } catch {
      showToast('Failed to load announcements', 'error');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Search announcements
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchAnnouncements();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const data = await searchMockAnnouncements(searchTerm);
      setAnnouncements(data);
    } catch {
      showToast('Search failed', 'error');
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

  // Open modal for adding new announcement
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      title: '',
      content: '',
      date: getTodayDate(), // Auto-select today's date
      recipients: 'All'
    });
  };

  // Open modal for editing announcement
  const openEditModal = (announcement: Announcement) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      recipients: announcement.recipients
    });
  };

  // Open delete confirmation modal
  const openDeleteModal = (announcement: Announcement) => {
    setIsDeleteModalOpen(true);
    setCurrentAnnouncement(announcement);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentAnnouncement(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result: Announcement;
      if (isEditMode && currentAnnouncement) {
        const updatedAnnouncement = {
          ...currentAnnouncement,
          ...formData,
          status: (new Date(formData.date) >= new Date() ? 'Active' : 'Expired') as 'Active' | 'Expired'
        };
        result = await updateMockAnnouncement(updatedAnnouncement);
        setAnnouncements(announcements.map(a => a.id === result.id ? result : a));
        showToast('Announcement updated successfully!', 'success');
      } else {
        result = await createMockAnnouncement({
          ...formData,
          status: new Date(formData.date) >= new Date() ? 'Active' : 'Expired'
        });
        setAnnouncements([result, ...announcements]);
        showToast('Announcement added successfully!', 'success');
      }
      closeModal();
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message || 'An error occurred', 'error');
      } else {
        showToast('An error occurred', 'error');
      }
    }
  };

  // Delete announcement
  const deleteAnnouncement = async () => {
    if (!currentAnnouncement) return;
    try {
      await deleteMockAnnouncement(currentAnnouncement.id);
      setAnnouncements(announcements.filter(a => a.id !== currentAnnouncement.id));
      showToast('Announcement deleted successfully!', 'success');
      closeModal();
    } catch {
      showToast('Failed to delete announcement', 'error');
    }
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
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
       <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Announcements
          </span>
        </h1>
      </div>

      {/* Search and Add Announcement */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements by title, content, date or status..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const createdDateTime = formatDateTime(announcement.createdAt);
              
              return (
                <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          To: {announcement.recipients}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          announcement.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Date and Time Information */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Due: {new Date(announcement.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Created: {createdDateTime.date} at {createdDateTime.time}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex mt-4 space-x-3">
                    <button
                      onClick={() => openEditModal(announcement)}
                      className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(announcement)}
                      className="text-red-600 hover:text-red-900 flex items-center text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {isSearching ? 'No matching announcements found' : 'No announcements found'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Announcement
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Announcement' : 'New Announcement'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter a title"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    placeholder="Enter announcement content"
                    title="Announcement Content"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                        required
                        placeholder="Select a date"
                        title="Select a date"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
                    <select
                      name="recipients"
                      value={formData.recipients}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      title="Send To"
                    >
                      <option value="All">All</option>
                      <option value="Teachers">Teachers</option>
                      <option value="Parents">Parents</option>
                    </select>
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
                    {isEditMode ? 'Update' : 'Create'} Announcement
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
                Are you sure you want to delete announcement <span className="font-semibold">"{currentAnnouncement?.title}"</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAnnouncement}
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

export default Announcements;