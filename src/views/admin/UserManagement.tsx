import { useState } from 'react';
import {
  Search, Edit, Trash2, Filter, Download, ChevronDown, ChevronUp,
  UserPlus, Shield, Users, Baby, X, FileText, CheckCircle, Lock, Mail
} from 'lucide-react';
import React from 'react';

type UserType = {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'child' | 'supervisor' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  joinDate: string;
  children?: string[]; // For parents
  classroom?: string; // For children and supervisors
  permissions?: string[]; // For admins and supervisors
};

const users: UserType[] = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    email: 'sarah@example.com', 
    role: 'parent', 
    status: 'active', 
    joinDate: '2023-01-10',
    lastLogin: '2023-06-15 08:30',
    children: ['Emma Johnson', 'Liam Johnson']
  },
  { 
    id: '2', 
    name: 'Michael Smith', 
    email: 'michael@example.com', 
    role: 'parent', 
    status: 'active', 
    joinDate: '2022-09-05',
    lastLogin: '2023-06-15 08:45',
    children: ['Noah Smith']
  },
  { 
    id: '3', 
    name: 'Emma Johnson', 
    email: 'emma@example.com', 
    role: 'child', 
    status: 'active', 
    joinDate: '2023-01-10',
    classroom: 'Sunflowers'
  },
  { 
    id: '4', 
    name: 'Lisa Chen', 
    email: 'lisa@daycare.com', 
    role: 'supervisor', 
    status: 'active', 
    joinDate: '2021-03-15',
    lastLogin: '2023-06-14 09:15',
    classroom: 'Butterflies',
    permissions: ['attendance', 'reports']
  },
  { 
    id: '5', 
    name: 'Admin User', 
    email: 'admin@daycare.com', 
    role: 'admin', 
    status: 'active', 
    joinDate: '2020-08-25',
    lastLogin: '2023-06-15 07:30',
    permissions: ['all']
  },
  { 
    id: '6', 
    name: 'James Wilson', 
    email: 'james@example.com', 
    role: 'parent', 
    status: 'pending', 
    joinDate: '2023-05-01'
  },
];

const sortKeys = ['name', 'email', 'role', 'status', 'joinDate', 'lastLogin'] as const;
type SortKey = typeof sortKeys[number];

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'parent' as UserType['role'],
    status: 'active' as UserType['status'],
    classroom: '',
    children: [] as string[],
    permissions: [] as string[],
  });

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((user) => activeFilter === 'all' || user.role === activeFilter || user.status === activeFilter)
    .sort((a, b) => {
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
  const indexOfLastUser = 1 * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const getStatusBadge = (status: UserType['status']) => {
    const statusClasses: Record<UserType['status'], string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: UserType['role']) => {
    const roleClasses: Record<UserType['role'], string> = {
      parent: 'bg-blue-100 text-blue-800',
      child: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-amber-100 text-amber-800',
      admin: 'bg-green-100 text-green-800',
    };
    const roleIcons: Record<UserType['role'], React.ReactNode> = {
      parent: <Users className="w-3 h-3 mr-1" />,
      child: <Baby className="w-3 h-3 mr-1" />,
      supervisor: <Shield className="w-3 h-3 mr-1" />,
      admin: <Lock className="w-3 h-3 mr-1" />,
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${roleClasses[role]} flex items-center`}>
        {roleIcons[role]}
        {role}
      </span>
    );
  };

  const openEditModal = (user: UserType) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      classroom: user.classroom || '',
      children: user.children || [],
      permissions: user.permissions || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: UserType) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = e.target;
    if (name === 'permissions') {
      setFormData(prev => ({
        ...prev,
        permissions: checked
          ? [...prev.permissions, value]
          : prev.permissions.filter(p => p !== value)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    console.log('Deleting user:', currentUser?.id);
    setShowDeleteModal(false);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
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

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
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
                      All Users
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</div>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'parent' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('parent'); setShowFilterDropdown(false); }}
                    >
                      Parents
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'child' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('child'); setShowFilterDropdown(false); }}
                    >
                      Children
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'supervisor' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('supervisor'); setShowFilterDropdown(false); }}
                    >
                      Supervisors
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'admin' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('admin'); setShowFilterDropdown(false); }}
                    >
                      Admins
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
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
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'pending' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('pending'); setShowFilterDropdown(false); }}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="dropdown relative">
                <button className="btn-outline bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex items-center">
                  <span className="mr-2">{selectedUsers.length} selected</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Activate
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <X className="w-4 h-4 mr-2 text-red-600" />
                      Deactivate
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      Send Email
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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
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
                    User
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortConfig.key === 'email' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('role')}
                >
                  <div className="flex items-center">
                    Role
                    {sortConfig.key === 'role' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
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
                  onClick={() => requestSort('lastLogin')}
                >
                  <div className="flex items-center">
                    Last Login
                    {sortConfig.key === 'lastLogin' && (
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
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#f3eeff] rounded-full flex items-center justify-center">
                          {user.role === 'child' ? (
                            <Baby className="text-[#6339C0]" />
                          ) : user.role === 'parent' ? (
                            <Users className="text-[#6339C0]" />
                          ) : user.role === 'supervisor' ? (
                            <Shield className="text-[#6339C0]" />
                          ) : (
                            <Lock className="text-[#6339C0]" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.role === 'parent' && user.children && (
                          <div>Children: {user.children.join(', ')}</div>
                        )}
                        {user.role === 'child' && user.classroom && (
                          <div>Class: {user.classroom}</div>
                        )}
                        {user.role === 'supervisor' && user.classroom && (
                          <div>Responsible for: {user.classroom}</div>
                        )}
                        {user.role === 'admin' && (
                          <div>Full system access</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin || 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-[#6339C0] hover:text-[#7e57ff]"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user)}
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
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                  <span className="font-medium">{filteredUsers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <ChevronUp className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        1 === page
                          ? 'z-10 bg-[#6339C0] border-[#6339C0] text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {formData.role === 'child' && (
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
                      >
                        <option value="">Select classroom</option>
                        <option value="Sunflowers">Sunflowers</option>
                        <option value="Butterflies">Butterflies</option>
                        <option value="Caterpillars">Caterpillars</option>
                      </select>
                    </div>
                  )}
                  {formData.role === 'supervisor' && (
                    <div>
                      <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">
                        Responsible Classroom
                      </label>
                      <select
                        id="classroom"
                        name="classroom"
                        value={formData.classroom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      >
                        <option value="">Select classroom</option>
                        <option value="Sunflowers">Sunflowers</option>
                        <option value="Butterflies">Butterflies</option>
                        <option value="Caterpillars">Caterpillars</option>
                        <option value="All">All Classrooms</option>
                      </select>
                    </div>
                  )}
                  {(formData.role === 'supervisor' || formData.role === 'admin') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permissions
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value="dashboard"
                            checked={formData.permissions.includes('dashboard')}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Dashboard Access</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value="attendance"
                            checked={formData.permissions.includes('attendance')}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Attendance Management</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value="reports"
                            checked={formData.permissions.includes('reports')}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Report Generation</span>
                        </label>
                        {formData.role === 'admin' && (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="permissions"
                              value="admin"
                              checked={formData.permissions.includes('admin')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Admin Privileges</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
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
                      <option value="pending">Pending</option>
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
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#f3eeff] rounded-full flex items-center justify-center">
                      {currentUser.role === 'child' ? (
                        <Baby className="text-[#6339C0]" />
                      ) : currentUser.role === 'parent' ? (
                        <Users className="text-[#6339C0]" />
                      ) : currentUser.role === 'supervisor' ? (
                        <Shield className="text-[#6339C0]" />
                      ) : (
                        <Lock className="text-[#6339C0]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{currentUser.name}</h3>
                      <p className="text-sm text-gray-500">Joined on {currentUser.joinDate}</p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      required
                    >
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {formData.role === 'child' && (
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
                      >
                        <option value="Sunflowers">Sunflowers</option>
                        <option value="Butterflies">Butterflies</option>
                        <option value="Caterpillars">Caterpillars</option>
                      </select>
                    </div>
                  )}
                  {formData.role === 'supervisor' && (
                    <div>
                      <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">
                        Responsible Classroom
                      </label>
                      <select
                        id="classroom"
                        name="classroom"
                        value={formData.classroom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                      >
                        <option value="Sunflowers">Sunflowers</option>
                        <option value="Butterflies">Butterflies</option>
                        <option value="Caterpillars">Caterpillars</option>
                        <option value="All">All Classrooms</option>
                      </select>
                    </div>
                  )}
                  {(formData.role === 'supervisor' || formData.role === 'admin') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permissions
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value="dashboard"
                            checked={formData.permissions.includes('dashboard')}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Dashboard Access</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value="attendance"
                            checked={formData.permissions.includes('attendance')}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Attendance Management</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value="reports"
                            checked={formData.permissions.includes('reports')}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Report Generation</span>
                        </label>
                        {formData.role === 'admin' && (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="permissions"
                              value="admin"
                              checked={formData.permissions.includes('admin')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Admin Privileges</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
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
                      <option value="pending">Pending</option>
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
      {showDeleteModal && currentUser && (
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
                  Are you sure you want to delete <span className="font-semibold">{currentUser.name}</span>? This will permanently remove all records associated with this user.
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
                        <p>This action cannot be undone. All user records, permissions, and associated data will be permanently deleted.</p>
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
                  Delete User
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
                <h2 className="text-xl font-bold text-gray-800">Export User Data</h2>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Select the format you want to export the user data in:
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
                    <span className="ml-2 text-sm text-gray-700">Include all user details</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                      checked={selectedUsers.length > 0}
                      disabled={selectedUsers.length === 0}
                    />
                    <span className={`ml-2 text-sm ${selectedUsers.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      Export only selected users ({selectedUsers.length})
                    </span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include role information</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include permission details</span>
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

export default UserManagement;