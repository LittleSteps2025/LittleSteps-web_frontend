import { useState, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, ChevronUp, X, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type AudienceType = 1 | 2 | 3 | 4 | 5;
// 1: supervisor, 2: teacher, 3: parent, 4: supervisor & teacher, 5: teacher & parent
const audienceMap: Record<AudienceType, string> = {
  1: 'Supervisor',
  2: 'Teacher',
  3: 'Parent',
  4: 'Supervisor & Teacher',
  5: 'Teacher & Parent',
};

type AnnouncementStatus = 'draft' | 'published' | 'archived';

type AnnouncementType = {
  ann_id: string;
  title: string;
  details: string;
  author_name: string;
  date: string;
  status: AnnouncementStatus;
  audience: AudienceType;
};

const AnnouncementManagement = () => {
  const { user } = useAuth(); // user: User | null
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<AnnouncementStatus | 'all'>('all');
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<AnnouncementType | null>(null);

  // Form state (only fields user can edit)
  const [formData, setFormData] = useState({
    title: '', // required
    details: '', // required
    status: 'draft' as AnnouncementStatus, // draft or published
    audience: 1 as AudienceType, // 1-5
    attachment: null as File | null, // optional
  });

  // Helper to get status label for button
  const getStatusButtonLabel = () => {
    if (formData.status === 'draft') return 'Save Draft';
    if (formData.status === 'published') return 'Publish Announcement';
    return 'Save';
  };

  // Helper to handle status change for Add modal
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AnnouncementStatus;
    setFormData(prev => ({ ...prev, status: value }));
  };

  // Helper to handle status change for Edit modal
  const handleEditStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AnnouncementStatus;
    setFormData(prev => ({ ...prev, status: value }));
  };

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5001/api/announcements');
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const data = await response.json();
        setAnnouncements(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Filter announcements
  const filteredAnnouncements = announcements
    .filter((announcement) => 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (announcement.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (announcement.author_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((announcement) => activeFilter === 'all' || announcement.status === activeFilter);

  const toggleSelectAnnouncement = (announcementId: string) => {
    setSelectedAnnouncements(prev =>
      prev.includes(announcementId) 
        ? prev.filter(id => id !== announcementId) 
        : [...prev, announcementId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAnnouncements.length === filteredAnnouncements.length) {
      setSelectedAnnouncements([]);
    } else {
      setSelectedAnnouncements(filteredAnnouncements.map(announcement => announcement.ann_id));
    }
  };

  const getStatusBadge = (status: AnnouncementStatus) => {
    const statusClasses: Record<AnnouncementStatus, string> = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getAudienceBadge = (audience: AudienceType) => {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 flex items-center">
        {audienceMap[audience]}
      </span>
    );
  };

  const openEditModal = (announcement: AnnouncementType) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      details: announcement.details,
      status: announcement.status,
      audience: announcement.audience,
      attachment: null, // Reset attachment on edit
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (announcement: AnnouncementType) => {
    setCurrentAnnouncement(announcement);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as any;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'audience' ? Number(value) : value
      }));
    }
  };

  // CRUD handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = showEditModal ? 'PUT' : 'POST';
      const url = showEditModal && currentAnnouncement
        ? `http://localhost:5001/api/announcements/${currentAnnouncement.ann_id}`
        : 'http://localhost:5001/api/announcements';
      // Only send fields required by backend
      const payload = {
        title: formData.title,
        details: formData.details,
        status: formData.status,
        audience: Number(formData.audience),
        user_id: user?.user_id ? user.user_id : user?.id // fallback to id if user_id missing
      };
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save announcement');
      setShowAddModal(false);
      setShowEditModal(false);
      // Refresh list
      const data = await response.json();
      if (method === 'POST') {
        setAnnouncements(prev => [data.data, ...prev]);
      } else {
        setAnnouncements(prev => prev.map(a => a.ann_id === data.data.ann_id ? data.data : a));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAnnouncement) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5001/api/announcements/${currentAnnouncement.ann_id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete announcement');
      setAnnouncements(prev => prev.filter(a => a.ann_id !== currentAnnouncement.ann_id));
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Announcement Center</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements by title, content or author..."
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
                Filter
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
                      All Announcements
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'draft' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('draft'); setShowFilterDropdown(false); }}
                    >
                      Drafts
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'published' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('published'); setShowFilterDropdown(false); }}
                    >
                      Published
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'archived' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('archived'); setShowFilterDropdown(false); }}
                    >
                      Archived
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {selectedAnnouncements.length > 0 && (
              <div className="dropdown relative">
                <button className="btn-outline bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex items-center">
                  <span className="mr-2">{selectedAnnouncements.length} selected</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Publish
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      Archive
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    checked={selectedAnnouncements.length === filteredAnnouncements.length && filteredAnnouncements.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Preview
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audience
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.ann_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedAnnouncements.includes(announcement.ann_id)}
                        onChange={() => toggleSelectAnnouncement(announcement.ann_id)}
                        className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                        title="Select announcement"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        {announcement.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{announcement.author_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAudienceBadge(announcement.audience)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(announcement.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {announcement.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(announcement)}
                          className="text-[#6339C0] hover:text-[#7e57ff]"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(announcement)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No announcements found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Create New Announcement</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      id="details"
                      name="details"
                      rows={5}
                      value={formData.details}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleStatusChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Publish Immediately</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                      Audience
                    </label>
                    <select
                      id="audience"
                      name="audience"
                      value={formData.audience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value={1}>Supervisor</option>
                      <option value={2}>Teacher</option>
                      <option value={3}>Parent</option>
                      <option value={4}>Supervisor & Teacher</option>
                      <option value={5}>Teacher & Parent</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                      Attachment (optional)
                    </label>
                    <input
                      type="file"
                      id="attachment"
                      name="attachment"
                      accept="*"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {getStatusButtonLabel()}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {showEditModal && currentAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Announcement</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      id="details"
                      name="details"
                      rows={5}
                      value={formData.details}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleEditStatusChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                      Audience
                    </label>
                    <select
                      id="audience"
                      name="audience"
                      value={formData.audience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value={1}>Supervisor</option>
                      <option value={2}>Teacher</option>
                      <option value={3}>Parent</option>
                      <option value={4}>Supervisor & Teacher</option>
                      <option value={5}>Teacher & Parent</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                      Attachment (optional)
                    </label>
                    <input
                      type="file"
                      id="attachment"
                      name="attachment"
                      accept="*"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentAnnouncement && (
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
                  Are you sure you want to delete the announcement <span className="font-semibold">"{currentAnnouncement.title}"</span>?
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Important Notice</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>This action cannot be undone. All replies and engagement data will also be deleted.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  Delete Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading and Error UI */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded shadow text-lg font-semibold text-gray-700">Loading...</div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow z-50">
          {error}
          <button className="ml-2 text-red-500" onClick={() => setError('')}>x</button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;