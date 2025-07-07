import { useState, useEffect } from 'react';
import { Users, Search, Edit, Trash2, UserPlus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Parent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: number;
};

type ValidationErrors = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  children?: string;
};

// Mock data for parents
const mockParents: Parent[] = [
  {
    id: 'parent-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    children: 2
  },
  {
    id: 'parent-002',
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    phone: '555-987-6543',
    children: 1
  },
  {
    id: 'parent-003',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '555-456-7890',
    children: 3
  },
  {
    id: 'parent-004',
    name: 'Sarah Davis',
    email: 'sarah.d@example.com',
    phone: '555-789-0123',
    children: 2
  },
  {
    id: 'parent-005',
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    phone: '555-234-5678',
    children: 1
  }
];

// Mock API functions
const fetchMockParents = async (): Promise<Parent[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockParents]);
    }, 500);
  });
};

const searchMockParents = async (term: string): Promise<Parent[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!term.trim()) {
        resolve([...mockParents]);
        return;
      }
      const filtered = mockParents.filter(parent => 
        parent.name.toLowerCase().includes(term.toLowerCase()) ||
        parent.email.toLowerCase().includes(term.toLowerCase()) ||
        parent.phone.includes(term) ||
        parent.id.toLowerCase().includes(term.toLowerCase())
      );
      resolve(filtered);
    }, 300); // Shorter delay for better UX
  });
};

const createMockParent = async (parent: Parent): Promise<Parent> => {
  return new Promise(resolve => {
    setTimeout(() => {
      mockParents.push(parent);
      resolve(parent);
    }, 500);
  });
};

const updateMockParent = async (parent: Parent): Promise<Parent> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockParents.findIndex(p => p.id === parent.id);
      if (index !== -1) {
        mockParents[index] = parent;
      }
      resolve(parent);
    }, 500);
  });
};

const deleteMockParent = async (id: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockParents.findIndex(p => p.id === id);
      if (index !== -1) {
        mockParents.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const Parents = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Parent>({
    id: '',
    name: '',
    email: '',
    phone: '',
    children: 1
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch parents from mock API
  useEffect(() => {
    fetchParents();
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

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMockParents();
      setParents(data);
    } catch {
      toast.error('Failed to load parents');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Search parents
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchParents();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const data = await searchMockParents(searchTerm);
      setParents(data);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'children' ? Number(value) : value
    });
  };

  // Validate form
  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!formData.id.trim()) errors.id = 'ID is required';
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.children || formData.children < 1) errors.children = 'Must have at least 1 child';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for adding new parent
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      children: 1
    });
    setValidationErrors({});
  };

  // Open modal for editing parent
  const openEditModal = (parent: Parent) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentParent(parent);
    setFormData({
      id: parent.id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      children: parent.children
    });
    setValidationErrors({});
  };

  // Open delete confirmation modal
  const openDeleteModal = (parent: Parent) => {
    setIsDeleteModalOpen(true);
    setCurrentParent(parent);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentParent(null);
    setValidationErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      let result;
      if (isEditMode) {
        result = await updateMockParent(formData);
        setParents(parents.map(parent => parent.id === formData.id ? result : parent));
        toast.success('Parent updated successfully!');
      } else {
        result = await createMockParent(formData);
        setParents([...parents, result]);
        toast.success('Parent added successfully!');
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

  // Delete parent
  const deleteParent = async () => {
    if (!currentParent) return;
    try {
      await deleteMockParent(currentParent.id);
      setParents(parents.filter(parent => parent.id !== currentParent.id));
      toast.success('Parent deleted successfully!');
      closeModal();
    } catch {
      toast.error('Failed to delete parent');
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
        <h1 className="text-2xl font-bold text-gray-800">Parents Management</h1>
      </div>

      {/* Search and Add Parent */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search parents by name, email, phone or ID..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {parents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {parent.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parent.email}</div>
                      <div className="text-sm text-gray-500">{parent.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parent.children}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(parent)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(parent)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
              {isSearching ? 'No matching parents found' : 'No parents found'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Parent
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Parent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Parent' : 'Add New Parent'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500" title="Close">
                  <X className="w-6 h-6" aria-hidden="true" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className={`w-full px-3 py-2 border rounded-md ${validationErrors.id ? 'border-red-500' : 'border-gray-300'} ${isEditMode ? 'bg-gray-100' : ''}`}
                      placeholder="Parent ID"
                    />
                    {validationErrors.id && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Parent's full name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="parent@example.com"
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Phone number"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                    <input
                      type="number"
                      name="children"
                      min="1"
                      value={formData.children}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${validationErrors.children ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Number of children"
                      title="Enter the number of children"
                    />
                    {validationErrors.children && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.children}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isEditMode ? 'Update' : 'Create'}
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
                Are you sure you want to delete parent <span className="font-semibold">{currentParent?.name}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteParent}
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

export default Parents;