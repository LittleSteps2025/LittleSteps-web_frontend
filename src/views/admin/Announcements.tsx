import { useState, type JSX } from 'react';
import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, ChevronUp, 
  MessageSquare, User, Users, Bell, X, CheckCircle, Send, Clock
} from 'lucide-react';

type AudienceType = 'all' | 'parents' | 'staff' | 'classroom' | 'specific';
type AnnouncementStatus = 'draft' | 'published' | 'archived';

type AnnouncementType = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  status: AnnouncementStatus;
  audience: {
    type: AudienceType;
    classrooms?: string[];
    specificUsers?: string[];
  };
  replies: {
    id: string;
    user: string;
    comment: string;
    date: string;
  }[];
};

const announcements: AnnouncementType[] = [
  { 
    id: '1', 
    title: 'Parent-Teacher Meeting', 
    content: 'We will be having our quarterly parent-teacher meetings next week. Please sign up for a time slot.', 
    author: 'Admin User', 
    date: '2023-06-10 09:30', 
    status: 'published',
    audience: {
      type: 'parents'
    },
    replies: [
      {
        id: '1-1',
        user: 'Sarah Johnson',
        comment: 'Looking forward to it!',
        date: '2023-06-10 11:45'
      },
      {
        id: '1-2',
        user: 'Michael Smith',
        comment: 'Will there be virtual options?',
        date: '2023-06-10 14:20'
      }
    ]
  },
  { 
    id: '2', 
    title: 'Staff Training Day', 
    content: 'Reminder: Mandatory staff training this Friday from 9am-12pm in the conference room.', 
    author: 'Lisa Chen', 
    date: '2023-06-05 14:00', 
    status: 'published',
    audience: {
      type: 'staff'
    },
    replies: [
      {
        id: '2-1',
        user: 'James Wilson',
        comment: 'I have a conflict, who should I contact?',
        date: '2023-06-05 15:30'
      }
    ]
  },
  { 
    id: '3', 
    title: 'Field Trip Permission Slips', 
    content: 'Permission slips for the museum field trip are due by Friday. Please return them to your child\'s teacher.', 
    author: 'Emma Davis', 
    date: '2023-06-01 10:15', 
    status: 'published',
    audience: {
      type: 'classroom',
      classrooms: ['Sunflowers', 'Butterflies']
    },
    replies: []
  },
  { 
    id: '4', 
    title: 'Summer Program Draft', 
    content: 'Draft of our summer program schedule. Please review and provide feedback.', 
    author: 'Admin User', 
    date: '2023-05-28 16:45', 
    status: 'draft',
    audience: {
      type: 'staff'
    },
    replies: []
  },
];

const classrooms = ['Sunflowers', 'Butterflies', 'Caterpillars'];
const staffUsers = ['Admin User', 'Lisa Chen', 'Emma Davis', 'James Wilson'];
const parentUsers = ['Sarah Johnson', 'Michael Smith', 'Jessica Brown'];

const AnnouncementManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<AnnouncementStatus | 'all'>('all');
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<AnnouncementType | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft' as AnnouncementStatus,
    audienceType: 'all' as AudienceType,
    selectedClassrooms: [] as string[],
    selectedUsers: [] as string[],
  });

  // Reply state
  const [replyText, setReplyText] = useState('');

  // Filter announcements
  const filteredAnnouncements = announcements
    .filter((announcement) => 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchTerm.toLowerCase())
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
      setSelectedAnnouncements(filteredAnnouncements.map(announcement => announcement.id));
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

  const getAudienceBadge = (audience: AnnouncementType['audience']) => {
    const audienceClasses: Record<AudienceType, string> = {
      all: 'bg-purple-100 text-purple-800',
      parents: 'bg-pink-100 text-pink-800',
      staff: 'bg-amber-100 text-amber-800',
      classroom: 'bg-indigo-100 text-indigo-800',
      specific: 'bg-teal-100 text-teal-800',
    };
    const audienceIcons: Record<AudienceType, JSX.Element> = {
      all: <Users className="w-3 h-3 mr-1" />,
      parents: <User className="w-3 h-3 mr-1" />,
      staff: <User className="w-3 h-3 mr-1" />,
      classroom: <Bell className="w-3 h-3 mr-1" />,
      specific: <User className="w-3 h-3 mr-1" />,
    };

    let audienceText = '';
    if (audience.type === 'classroom' && audience.classrooms) {
      audienceText = `${audience.classrooms.join(', ')} classes`;
    } else if (audience.type === 'specific' && audience.specificUsers) {
      audienceText = `${audience.specificUsers.length} users`;
    } else {
      audienceText = audience.type;
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${audienceClasses[audience.type]} flex items-center`}>
        {audienceIcons[audience.type]}
        {audienceText}
      </span>
    );
  };

  const openEditModal = (announcement: AnnouncementType) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      audienceType: announcement.audience.type,
      selectedClassrooms: announcement.audience.classrooms || [],
      selectedUsers: announcement.audience.specificUsers || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (announcement: AnnouncementType) => {
    setCurrentAnnouncement(announcement);
    setShowDeleteModal(true);
  };

  const openRepliesModal = (announcement: AnnouncementType) => {
    setCurrentAnnouncement(announcement);
    setShowRepliesModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type: 'classroom' | 'user', value: string) => {
    if (type === 'classroom') {
      setFormData(prev => ({
        ...prev,
        selectedClassrooms: prev.selectedClassrooms.includes(value)
          ? prev.selectedClassrooms.filter(c => c !== value)
          : [...prev.selectedClassrooms, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedUsers: prev.selectedUsers.includes(value)
          ? prev.selectedUsers.filter(u => u !== value)
          : [...prev.selectedUsers, value]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Announcement submitted:', formData);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    console.log('Deleting announcement:', currentAnnouncement?.id);
    setShowDeleteModal(false);
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && currentAnnouncement) {
      console.log('Adding reply:', replyText);
      setReplyText('');
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
                  <tr key={announcement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedAnnouncements.includes(announcement.id)}
                        onChange={() => toggleSelectAnnouncement(announcement.id)}
                        className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                        title="Select announcement"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        {announcement.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{announcement.author}</div>
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
                          onClick={() => openRepliesModal(announcement)}
                          className="text-blue-500 hover:text-blue-700 relative"
                        >
                          <MessageSquare className="w-5 h-5" />
                          {announcement.replies.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              {announcement.replies.length}
                            </span>
                          )}
                        </button>
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
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={5}
                      value={formData.content}
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
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Publish Immediately</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="audienceType" className="block text-sm font-medium text-gray-700 mb-1">
                      Audience
                    </label>
                    <select
                      id="audienceType"
                      name="audienceType"
                      value={formData.audienceType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="all">Everyone</option>
                      <option value="parents">All Parents</option>
                      <option value="staff">All Staff</option>
                      <option value="staff">All Supervisors</option>
                      <option value="staff">All Teachers</option>
                      <option value="classroom">Specific Classrooms</option>
                      <option value="specific">Specific Users</option>
                    </select>
                  </div>
                  {formData.audienceType === 'classroom' && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Classrooms
                      </label>
                      <div className="space-y-2">
                        {classrooms.map(classroom => (
                          <label key={classroom} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.selectedClassrooms.includes(classroom)}
                              onChange={() => handleCheckboxChange('classroom', classroom)}
                              className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{classroom}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.audienceType === 'specific' && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Users
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Staff</h4>
                          <div className="space-y-2">
                            {staffUsers.map(user => (
                              <label key={user} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedUsers.includes(user)}
                                  onChange={() => handleCheckboxChange('user', user)}
                                  className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{user}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Parents</h4>
                          <div className="space-y-2">
                            {parentUsers.map(user => (
                              <label key={user} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedUsers.includes(user)}
                                  onChange={() => handleCheckboxChange('user', user)}
                                  className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{user}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    {formData.status === 'draft' ? 'Save Draft' : 'Publish Announcement'}
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
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={5}
                      value={formData.content}
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
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="audienceType" className="block text-sm font-medium text-gray-700 mb-1">
                      Audience
                    </label>
                    <select
                      id="audienceType"
                      name="audienceType"
                      value={formData.audienceType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="all">Everyone</option>
                      <option value="parents">All Parents</option>
                      <option value="staff">All Staff</option>
                      <option value="classroom">Specific Classrooms</option>
                      <option value="specific">Specific Users</option>
                    </select>
                  </div>
                  {formData.audienceType === 'classroom' && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Classrooms
                      </label>
                      <div className="space-y-2">
                        {classrooms.map(classroom => (
                          <label key={classroom} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.selectedClassrooms.includes(classroom)}
                              onChange={() => handleCheckboxChange('classroom', classroom)}
                              className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{classroom}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.audienceType === 'specific' && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Users
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Staff</h4>
                          <div className="space-y-2">
                            {staffUsers.map(user => (
                              <label key={user} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedUsers.includes(user)}
                                  onChange={() => handleCheckboxChange('user', user)}
                                  className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{user}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Parents</h4>
                          <div className="space-y-2">
                            {parentUsers.map(user => (
                              <label key={user} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedUsers.includes(user)}
                                  onChange={() => handleCheckboxChange('user', user)}
                                  className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{user}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

      {/* Replies Modal */}
      {showRepliesModal && currentAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Replies to "{currentAnnouncement.title}"</h2>
                <button onClick={() => setShowRepliesModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {currentAnnouncement.replies.length > 0 ? (
                  currentAnnouncement.replies.map(reply => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm">{reply.user}</span>
                          <span className="text-xs text-gray-400">{reply.date}</span>
                        </div>
                        <div className="text-gray-700 text-sm mt-1">{reply.comment}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No replies yet.</div>
                )}
              </div>
              <form onSubmit={handleAddReply} className="mt-6">
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">Add a reply</label>
                <textarea
                  id="reply"
                  name="reply"
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                  required
                />
                <div className="mt-3 flex justify-end">
                  <button type="submit" className="btn-primary flex items-center">
                    <Send className="w-4 h-4 mr-2" /> Send
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

export default AnnouncementManagement;