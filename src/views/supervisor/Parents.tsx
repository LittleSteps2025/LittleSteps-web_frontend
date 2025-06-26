import { useState } from 'react';
import { Users, Search, Edit, Trash2, Send, UserPlus, X } from 'lucide-react';
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

const Parents = () => {
  const [parents, setParents] = useState<Parent[]>([
    { id: '123456789V', name: 'John Smith', email: 'john@example.com', phone: '0775123456', children: 2 },
    { id: '987654321V', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '0775567878', children: 1 },
    { id: '456789123V', name: 'Michael Chen', email: 'michael@example.com', phone: '0775901234', children: 1 }
  ]);
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

  // Generate a random 6-digit code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Filter parents based on search term
  const filteredParents = parents.filter(parent => {
    const searchLower = searchTerm.toLowerCase();
    return (
      parent.name.toLowerCase().includes(searchLower) ||
      parent.id.toLowerCase().includes(searchLower) ||
      parent.phone.includes(searchTerm)
    );
  });

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

    if (!formData.id) errors.id = 'NIC is required';
    else if (!/^[0-9]{9}[Vv]$|^[0-9]{12}$/.test(formData.id)) errors.id = 'Invalid NIC format';

    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email format';

    if (!formData.phone) errors.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(formData.phone)) errors.phone = 'Phone must be 10 digits';

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditMode) {
      // Update existing parent
      if (!currentParent) {
        toast.error('No parent selected for editing.');
        return;
      }
      setParents(parents.map(parent =>
        parent.id === currentParent.id ? formData : parent
      ));
      toast.success('Parent updated successfully!');
    } else {
      // Add new parent
      if (parents.some(parent => parent.id === formData.id)) {
        toast.error('A parent with this NIC already exists');
        return;
      }

      setParents([...parents, formData]);

      // In a real app, you would send this code via SMS API
      const verificationCode = generateVerificationCode();
      toast.success(
        <div>
          <p>Parent registered successfully!</p>
          <p>Verification code sent to {formData.phone}: <strong>{verificationCode}</strong></p>
        </div>
      );
    }

    closeModal();
  };

  // Delete parent
  const deleteParent = () => {
    if (!currentParent) return;
    setParents(parents.filter(parent => parent.id !== currentParent.id));
    toast.success('Parent deleted successfully!');
    closeModal();
  };

  // Send verification code (simulated)
  const sendVerificationCode = (parent: Parent) => {
    const verificationCode = generateVerificationCode();
    toast.info(
      <div>
        <p>New verification code sent to {parent.phone}:</p>
        <p className="font-bold text-center text-lg">{verificationCode}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Parents Management</h1>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Parent
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Search Bar */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, NIC or phone..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Parents Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
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
                      <button
                        onClick={() => sendVerificationCode(parent)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Resend Code"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No parents found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className={`w-full px-3 py-2 border rounded-md ${validationErrors.id ? 'border-red-500' : 'border-gray-300'} ${isEditMode ? 'bg-gray-100' : ''}`}
                      placeholder="e.g., 123456789V or 123456789012"
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
                      placeholder="0771234567"
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
                      placeholder="Enter number of children"
                      title="Number of Children"
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
                    {isEditMode ? 'Update Parent' : 'Register Parent'}
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
                </button>
              </div>

              <p className="mb-6 text-gray-600">
                Are you sure you want to delete parent <span className="font-semibold">{currentParent?.name}</span> (NIC: {currentParent?.id})? This action cannot be undone.
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
                  Delete Parent
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