import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Calendar, Clock, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  status: 'Active' | 'Expired';
};

// Mock data for announcements
const mockAnnouncements: Announcement[] = [
  {
    id: 'announcement-001',
    title: 'Parent-Teacher Meeting',
    content: 'Monthly meeting scheduled for next week',
    date: '2023-05-20',
    status: 'Active'
  },
  {
    id: 'announcement-002',
    title: 'School Holiday',
    content: 'School will be closed on May 25th',
    date: '2023-05-25',
    status: 'Active'
  },
  {
    id: 'announcement-003',
    title: 'Field Trip',
    content: 'Permission slips due by Friday',
    date: '2023-05-12',
    status: 'Expired'
  }
];

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
        announcement.id.toLowerCase().includes(term.toLowerCase())
      );
      resolve(filtered);
    }, 300);
  });
};

const createMockAnnouncement = async (announcement: Omit<Announcement, 'id'>): Promise<Announcement> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newAnnouncement = { 
        ...announcement, 
        id: `announcement-${Math.floor(1000 + Math.random() * 9000)}`,
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
  const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'status'>>({
    title: '',
    content: '',
    date: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
      toast.error('Failed to load announcements');
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
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      date: ''
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
      date: announcement.date
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
      let result;
      if (isEditMode && currentAnnouncement) {
        const updatedAnnouncement = {
          ...currentAnnouncement,
          ...formData,
          status: new Date(formData.date) >= new Date() ? 'Active' : 'Expired'
        };
        result = await updateMockAnnouncement(updatedAnnouncement);
        setAnnouncements(announcements.map(a => a.id === result.id ? result : a));
        toast.success('Announcement updated successfully!');
      } else {
        result = await createMockAnnouncement({
          ...formData,
          status: new Date(formData.date) >= new Date() ? 'Active' : 'Expired'
        });
        setAnnouncements([result, ...announcements]);
        toast.success('Announcement added successfully!');
      }
      closeModal();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    }
  };

  // Delete announcement
  const deleteAnnouncement = async () => {
    if (!currentAnnouncement) return;
    try {
      await deleteMockAnnouncement(currentAnnouncement.id);
      setAnnouncements(announcements.filter(a => a.id !== currentAnnouncement.id));
      toast.success('Announcement deleted successfully!');
      closeModal();
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  // Resend announcement
  const resendAnnouncement = async (id: string) => {
    try {
      // Simulate resend action
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Announcement resent successfully!');
    } catch {
      toast.error('Failed to resend announcement');
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
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
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.status}
                  </span>
                </div>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <div className="flex items-center mr-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(announcement.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {announcement.status === 'Active' ? 'Active' : 'Expired'}
                  </div>
                </div>
                <div className="flex mt-4 space-x-3">
                  <button 
                    onClick={() => resendAnnouncement(announcement.id)}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Resend
                  </button>
                  <button
                    onClick={() => openEditModal(announcement)}
                    className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(announcement)}
                    className="text-red-600 hover:text-red-900 flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
                  />
                </div>

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
                    />
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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