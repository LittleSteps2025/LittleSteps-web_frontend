import { useState } from 'react';
import {
  Search, Edit, Trash2, Filter, Download, ChevronDown, ChevronUp, Baby, Calendar, School, X, FileText, CheckCircle
} from 'lucide-react';
import UserModals, { type UserType } from './UserModals';

type ChildType = {
  id: string;
  name: string;
  birthDate: string;
  age: string;
  parentName: string;
  parentContact: string;
  classroom: string;
  allergies: string[];
  status: 'active' | 'inactive' | 'waitlist';
  enrollmentDate: string;
  lastCheckIn?: string;
};

const children: ChildType[] = [
  { 
    id: '1', 
    name: 'Emma Johnson', 
    birthDate: '2020-05-15', 
    age: '3 years', 
    parentName: 'Sarah Johnson', 
    parentContact: 'sarah@example.com', 
    classroom: 'Sunflowers', 
    allergies: ['Peanuts'], 
    status: 'active', 
    enrollmentDate: '2023-01-10',
    lastCheckIn: '2023-06-15 08:30'
  },
  { 
    id: '2', 
    name: 'Liam Smith', 
    birthDate: '2019-11-03', 
    age: '4 years', 
    parentName: 'Michael Smith', 
    parentContact: 'michael@example.com', 
    classroom: 'Butterflies', 
    allergies: [], 
    status: 'active', 
    enrollmentDate: '2022-09-05',
    lastCheckIn: '2023-06-15 08:45'
  },
  { 
    id: '3', 
    name: 'Olivia Williams', 
    birthDate: '2021-02-20', 
    age: '2 years', 
    parentName: 'James Williams', 
    parentContact: 'james@example.com', 
    classroom: 'Caterpillars', 
    allergies: ['Dairy', 'Eggs'], 
    status: 'active', 
    enrollmentDate: '2023-03-15',
    lastCheckIn: '2023-06-14 09:15'
  },
  { 
    id: '4', 
    name: 'Noah Brown', 
    birthDate: '2022-01-10', 
    age: '1 year', 
    parentName: 'Jessica Brown', 
    parentContact: 'jessica@example.com', 
    classroom: 'Waitlist', 
    allergies: [], 
    status: 'waitlist', 
    enrollmentDate: '2023-05-01'
  },
  { 
    id: '5', 
    name: 'Ava Jones', 
    birthDate: '2020-08-25', 
    age: '2 years', 
    parentName: 'David Jones', 
    parentContact: 'david@example.com', 
    classroom: 'Sunflowers', 
    allergies: ['Tree nuts'], 
    status: 'inactive', 
    enrollmentDate: '2022-11-18',
    lastCheckIn: '2023-05-30 09:00'
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sortKeys = ['name', 'classroom', 'status', 'enrollmentDate', 'lastCheckIn'] as const;
type SortKey = typeof sortKeys[number];

const ChildManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentChild, setCurrentChild] = useState<ChildType | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    parentName: '',
    parentContact: '',
    classroom: '',
    allergies: '',
    status: 'active' as ChildType['status']
  });

  // User modal state and handlers (minimal, only for modals)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showExportUserModal, setShowExportUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '' as UserType['role'],
    status: 'active' as UserType['status'],
  });
  const [currentUser] = useState<UserType | null>(null);
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddUserModal(false);
  };
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditUserModal(false);
  };
  const handleDeleteUser = () => {
    setShowDeleteUserModal(false);
  };
  const handleExportUser = () => {
    setShowExportUserModal(false);
  };

  // Filter and sort children
  const filteredChildren = children
    .filter((child: ChildType) => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.classroom.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((child: ChildType) => activeFilter === 'all' || child.status === activeFilter)
    .sort((a: ChildType, b: ChildType) => {
      const key = sortConfig.key;
      const aValue = a[key] ?? '';
      const bValue = b[key] ?? '';
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const indexOfLastChild = 1 * itemsPerPage;
  const indexOfFirstChild = indexOfLastChild - itemsPerPage;
  const currentChildren = filteredChildren.slice(indexOfFirstChild, indexOfLastChild);
  const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectChild = (childId: string) => {
    setSelectedChildren(prev =>
      prev.includes(childId) 
        ? prev.filter(id => id !== childId) 
        : [...prev, childId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedChildren.length === currentChildren.length) {
      setSelectedChildren([]);
    } else {
      setSelectedChildren(currentChildren.map(child => child.id));
    }
  };

  const getStatusBadge = (status: ChildType['status']) => {
    const statusClasses: Record<ChildType['status'], string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      waitlist: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getClassroomBadge = (classroom: string) => {
    const classroomColors: Record<string, string> = {
      'Sunflowers': 'bg-amber-100 text-amber-800',
      'Butterflies': 'bg-blue-100 text-blue-800',
      'Caterpillars': 'bg-green-100 text-green-800',
      'Waitlist': 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classroomColors[classroom] || 'bg-purple-100 text-purple-800'}`}>
        {classroom}
      </span>
    );
  };

  const openEditModal = (child: ChildType) => {
    setCurrentChild(child);
    setFormData({
      name: child.name,
      birthDate: child.birthDate,
      parentName: child.parentName,
      parentContact: child.parentContact,
      classroom: child.classroom,
      allergies: child.allergies.join(', '),
      status: child.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (child: ChildType) => {
    setCurrentChild(child);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to save the child
    console.log('Form submitted:', formData);
    // Close the modal after submission
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    // Here you would typically call an API to delete the child
    console.log('Deleting child:', currentChild?.id);
    setShowDeleteModal(false);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Here you would typically call an API to export data
    console.log(`Exporting data as ${format}`);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Child Management</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          {/* <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </button> */}
          <button 
            onClick={() => setShowExportModal(true)} 
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
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
              placeholder="Search children by name, parent or classroom..."
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
                      All Children
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'active' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('active'); setShowFilterDropdown(false); }}
                    >
                      Active
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'inactive' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('inactive'); setShowFilterDropdown(false); }}
                    >
                      Inactive
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'waitlist' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('waitlist'); setShowFilterDropdown(false); }}
                    >
                      Waitlist
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {selectedChildren.length > 0 && (
              <div className="dropdown relative">
                <button className="btn-outline bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex items-center">
                  <span className="mr-2">{selectedChildren.length} selected</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Mark Active
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <X className="w-4 h-4 mr-2 text-red-600" />
                      Mark Inactive
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <School className="w-4 h-4 mr-2 text-blue-600" />
                      Assign Classroom
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

      {/* Children Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    checked={selectedChildren.length === currentChildren.length && currentChildren.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                  />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Child
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Info
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('classroom')}
                >
                  <div className="flex items-center">
                    Classroom
                    {sortConfig.key === 'classroom' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allergies
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('lastCheckIn')}
                >
                  <div className="flex items-center">
                    Last Check-In
                    {sortConfig.key === 'lastCheckIn' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentChildren.length > 0 ? (
                currentChildren.map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedChildren.includes(child.id)}
                        onChange={() => toggleSelectChild(child.id)}
                        className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#f3eeff] rounded-full flex items-center justify-center">
                          <Baby className="text-[#6339C0]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{child.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {child.birthDate} ({child.age})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{child.parentName}</div>
                      <div className="text-sm text-gray-500">{child.parentContact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getClassroomBadge(child.classroom)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {child.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {child.allergies.map(allergy => (
                            <span key={allergy} className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(child.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {child.lastCheckIn || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(child)}
                          className="text-[#6339C0] hover:text-[#7e57ff]"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(child)}
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
                    No children found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (same as UserManagement) */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
            {/* ... (same pagination implementation as UserManagement) */}
          </div>
        )}
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Child</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Child's Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Name
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Contact
                    </label>
                    <input
                      type="email"
                      id="parentContact"
                      name="parentContact"
                      value={formData.parentContact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">
                      Classroom
                    </label>
                    <select
                      id="classroom"
                      name="classroom"
                      value={formData.classroom}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="">Select classroom</option>
                      <option value="Sunflowers">Sunflowers (2-3 years)</option>
                      <option value="Butterflies">Butterflies (3-4 years)</option>
                      <option value="Caterpillars">Caterpillars (1-2 years)</option>
                      <option value="Waitlist">Waitlist</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma separated)
                    </label>
                    <input
                      type="text"
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      placeholder="Peanuts, Dairy, Eggs, etc."
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="waitlist">Waitlist</option>
                    </select>
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
                    Add Child
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditModal && currentChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Child</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#f3eeff] rounded-full flex items-center justify-center">
                      <Baby className="text-[#6339C0]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{currentChild.name}</h3>
                      <p className="text-sm text-gray-500">Enrolled on {currentChild.enrollmentDate}</p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Child's Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Name
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Contact
                    </label>
                    <input
                      type="email"
                      id="parentContact"
                      name="parentContact"
                      value={formData.parentContact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">
                      Classroom
                    </label>
                    <select
                      id="classroom"
                      name="classroom"
                      value={formData.classroom}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="Sunflowers">Sunflowers (2-3 years)</option>
                      <option value="Butterflies">Butterflies (3-4 years)</option>
                      <option value="Caterpillars">Caterpillars (1-2 years)</option>
                      <option value="Waitlist">Waitlist</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma separated)
                    </label>
                    <input
                      type="text"
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      placeholder="Peanuts, Dairy, Eggs, etc."
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="waitlist">Waitlist</option>
                    </select>
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
      {showDeleteModal && currentChild && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  Are you sure you want to delete <span className="font-semibold">{currentChild.name}</span>? This will permanently remove all records associated with this child.
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
                        <p>This action cannot be undone. All attendance records, photos, and other data will be permanently deleted.</p>
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
                  Delete Child Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Export Child Data</h2>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Select the format you want to export the child data in:
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
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include all child details</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                      checked={selectedChildren.length > 0}
                      disabled={selectedChildren.length === 0}
                    />
                    <span className={`ml-2 text-sm ${selectedChildren.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      Export only selected children ({selectedChildren.length})
                    </span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include medical/allergy information</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include attendance history</span>
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

      {/* User Management Modals */}
      <UserModals
        showAdd={showAddUserModal}
        showEdit={showEditUserModal}
        showDelete={showDeleteUserModal}
        showExport={showExportUserModal}
        userForm={userForm}
        currentUser={currentUser}
        onCloseAdd={() => setShowAddUserModal(false)}
        onCloseEdit={() => setShowEditUserModal(false)}
        onCloseDelete={() => setShowDeleteUserModal(false)}
        onCloseExport={() => setShowExportUserModal(false)}
        onChange={handleUserInputChange}
        onAdd={handleAddUserSubmit}
        onEdit={handleEditUserSubmit}
        onDelete={handleDeleteUser}
        onExport={handleExportUser}
      />
    </div>
  );
};

export default ChildManagement;