import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  classroom: string;
  subjects: string[];
  profileImage?: string;
};

// Mock data for teachers
const mockTeachers: Teacher[] = [
  {
    id: 'teacher-001',
    name: 'malith',
    email: 'maith@gmail.com',
    phone: '11111111',
    classroom: 'Sunflower',
    subjects: ['Math', 'Science'],
    profileImage: 'https://randomuser.me/api/portraits/men/72.jpg'
  },
  {
    id: 'teacher-002',
    name: 'chathumini',
    email: 'chathumini@gmail.com',
    phone: '22222222',
    classroom: 'Butterfly',
    subjects: ['Language', 'Arts'],
    profileImage: 'https://randomuser.me/api/portraits/women/62.jpg'
  },
  {
    id: 'teacher-003',
    name: 'Farshad',
    email: 'Farshad@gmail.com',
    phone: '333333333',
    classroom: 'Rainbow',
    subjects: ['Music', 'Dance'],
    profileImage: 'https://randomuser.me/api/portraits/men/44.jpg'
  }
];

// Mock API functions
const fetchMockTeachers = async (): Promise<Teacher[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockTeachers]);
    }, 500);
  });
};

const searchMockTeachers = async (term: string): Promise<Teacher[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!term.trim()) {
        resolve([...mockTeachers]);
        return;
      }
      const filtered = mockTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(term.toLowerCase()) ||
        teacher.email.toLowerCase().includes(term.toLowerCase()) ||
        teacher.phone.includes(term) ||
        teacher.classroom.toLowerCase().includes(term.toLowerCase()) ||
        teacher.subjects.some(subject => subject.toLowerCase().includes(term.toLowerCase())) ||
        teacher.id.toLowerCase().includes(term.toLowerCase())
      );
      resolve(filtered);
    }, 300);
  });
};

const createMockTeacher = async (teacher: Teacher): Promise<Teacher> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newTeacher = { 
        ...teacher, 
        id: `teacher-${Math.floor(1000 + Math.random() * 9000)}`,
        profileImage: teacher.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`
      };
      mockTeachers.push(newTeacher);
      resolve(newTeacher);
    }, 500);
  });
};

const updateMockTeacher = async (teacher: Teacher): Promise<Teacher> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockTeachers.findIndex(t => t.id === teacher.id);
      if (index !== -1) {
        mockTeachers[index] = teacher;
      }
      resolve(teacher);
    }, 500);
  });
};

const deleteMockTeacher = async (id: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockTeachers.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTeachers.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Teacher>({
    id: '',
    name: '',
    email: '',
    phone: '',
    classroom: '',
    subjects: [],
    profileImage: ''
  });
  const [newSubject, setNewSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch teachers from mock API
  useEffect(() => {
    fetchTeachers();
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

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMockTeachers();
      setTeachers(data);
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Search teachers
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchTeachers();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const data = await searchMockTeachers(searchTerm);
      setTeachers(data);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({
          ...formData,
          profileImage: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle subject addition
  const handleAddSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject]
      });
      setNewSubject('');
    }
  };

  // Handle subject removal
  const handleRemoveSubject = (subjectToRemove: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(subject => subject !== subjectToRemove)
    });
  };

  // Open modal for adding new teacher
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      classroom: '',
      subjects: [],
      profileImage: ''
    });
    setImagePreview(null);
  };

  // Open modal for editing teacher
  const openEditModal = (teacher: Teacher) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentTeacher(teacher);
    setFormData({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      classroom: teacher.classroom,
      subjects: [...teacher.subjects],
      profileImage: teacher.profileImage || ''
    });
    setImagePreview(teacher.profileImage || null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (teacher: Teacher) => {
    setIsDeleteModalOpen(true);
    setCurrentTeacher(teacher);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentTeacher(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result: Teacher;
      if (isEditMode) {
        result = await updateMockTeacher(formData);
        setTeachers(teachers.map(teacher => teacher.id === formData.id ? result : teacher));
        toast.success('Teacher updated successfully!');
      } else {
        result = await createMockTeacher(formData);
        setTeachers([...teachers, result]);
        toast.success('Teacher added successfully!');
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

  // Delete teacher
  const deleteTeacher = async () => {
    if (!currentTeacher) return;
    try {
      await deleteMockTeacher(currentTeacher.id);
      setTeachers(teachers.filter(teacher => teacher.id !== currentTeacher.id));
      toast.success('Teacher deleted successfully!');
      closeModal();
    } catch {
      toast.error('Failed to delete teacher');
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
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Teachers
          </span>
        </h1>
      </div>

      {/* Search and Add Teacher */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers by name, email, phone, classroom or subjects..."
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
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {teachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={teacher.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`} 
                            alt={teacher.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                          <div className="text-sm text-gray-500">{teacher.classroom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="mr-2 w-4 h-4" />
                        {teacher.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Phone className="mr-2 w-4 h-4" />
                        {teacher.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((subject, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(teacher)}
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
              {isSearching ? 'No matching teachers found' : 'No teachers found'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Teacher
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
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
                  {/* Teacher Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-700 border-b border-indigo-100 pb-2">
                      Teacher Information
                    </h3>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <img 
                          className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                          src={imagePreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`}
                          alt="Profile preview"
                        />
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({...formData, profileImage: ''});
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            title="Remove uploaded image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <label className="cursor-pointer bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200">
                        <span>Upload Photo</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter full name"
                        title="Full Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        pattern="[0-9]{10}"
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
                      <div className="relative">
                        <select
                          name="classroom"
                          value={formData.classroom}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                          required
                          aria-label="Classroom"
                        >
                          <option value="">Select Classroom</option>
                          <option value="Sunflower">Sunflower</option>
                          <option value="Butterfly">Butterfly</option>
                          <option value="Rainbow">Rainbow</option>
                          <option value="Starfish">Starfish</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-700 border-b border-indigo-100 pb-2">
                      Subjects
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Add Subject</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter subject name"
                          title="Enter subject name"
                        />
                        <button
                          type="button"
                          onClick={handleAddSubject}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Subjects</label>
                      {formData.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.subjects.map((subject, i) => (
                            <div key={i} className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                              <span className="text-sm">{subject}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubject(subject)}
                                className="ml-2 text-gray-500 hover:text-red-500"
                                title={`Remove subject ${subject}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No subjects added yet</p>
                      )}
                    </div>
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
                    {isEditMode ? 'Update' : 'Add'} Teacher
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
                Are you sure you want to delete teacher <span className="font-semibold">{currentTeacher?.name}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteTeacher}
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

export default Teachers;