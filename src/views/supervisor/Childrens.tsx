import { useState, useEffect } from 'react';
import { Search, Plus, X, ChevronDown, Calendar, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Student = {
  id: string;
  name: string;
  age: number;
  classroom: string;
  birthday: string;
  parentName: string;
  parentNIC: string;
  parentEmail: string;
  parentAddress: string;
  parentContact: string;
  profileImage?: string;
};

// Mock data for students
const mockStudents: Student[] = [
  {
    id: 'student-001',
    name: 'malith',
    age: 4,
    classroom: 'Sunflower',
    birthday: '2019-05-15',
    parentName: 'damsara',
    parentNIC: '123456789V',
    parentEmail: 'john.smith@example.com',
    parentAddress: '123 Main St, City',
    parentContact: '5553333333',
    profileImage: 'https://randomuser.me/api/portraits/lego/1.jpg'
  },
  {
    id: 'student-002',
    name: 'chathumini',
    age: 3,
    classroom: 'Butterfly',
    birthday: '2020-02-20',
    parentName: 'Silva',
    parentNIC: '987654321V',
    parentEmail: 'michael.chen@example.com',
    parentAddress: '456 Oak Ave, Town',
    parentContact: '77777777777',
    profileImage: 'https://randomuser.me/api/portraits/lego/5.jpg'
  },
  {
    id: 'student-003',
    name: 'Farshad',
    age: 5,
    classroom: 'Rainbow',
    birthday: '2018-11-10',
    parentName: 'Mohomad',
    parentNIC: '456123789V',
    parentEmail: 'sarah.j@example.com',
    parentAddress: '789 Pine Rd, Village',
    parentContact: '2554354375870',
    profileImage: 'https://randomuser.me/api/portraits/lego/3.jpg'
  }
];

// Mock API functions
const fetchMockStudents = async (): Promise<Student[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockStudents]);
    }, 500);
  });
};

const searchMockStudents = async (term: string): Promise<Student[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!term.trim()) {
        resolve([...mockStudents]);
        return;
      }
      const filtered = mockStudents.filter(student => 
        student.name.toLowerCase().includes(term.toLowerCase()) ||
        student.classroom.toLowerCase().includes(term.toLowerCase()) ||
        student.parentName.toLowerCase().includes(term.toLowerCase()) ||
        student.parentContact.includes(term) ||
        student.id.toLowerCase().includes(term.toLowerCase())
      );
      resolve(filtered);
    }, 300);
  });
};

const createMockStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newStudent = { 
        ...student, 
        id: `student-${Math.floor(1000 + Math.random() * 9000)}`,
        profileImage: student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`
      };
      mockStudents.push(newStudent);
      resolve(newStudent);
    }, 500);
  });
};

const updateMockStudent = async (student: Student): Promise<Student> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockStudents.findIndex(s => s.id === student.id);
      if (index !== -1) {
        mockStudents[index] = student;
      }
      resolve(student);
    }, 500);
  });
};

const deleteMockStudent = async (id: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockStudents.findIndex(s => s.id === id);
      if (index !== -1) {
        mockStudents.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const Childrens = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<Student, 'id'> & { id?: string }>({
    name: '',
    age: 0,
    classroom: '',
    birthday: '',
    parentName: '',
    parentNIC: '',
    parentEmail: '',
    parentAddress: '',
    parentContact: '',
    profileImage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch students from mock API
  useEffect(() => {
    fetchStudents();
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

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMockStudents();
      setStudents(data);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Search students
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchStudents();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const data = await searchMockStudents(searchTerm);
      setStudents(data);
    } catch {
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
      [name]: name === 'age' ? Number(value) : value
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

  // Open modal for adding new student
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      name: '',
      age: 0,
      classroom: '',
      birthday: '',
      parentName: '',
      parentNIC: '',
      parentEmail: '',
      parentAddress: '',
      parentContact: '',
      profileImage: ''
    });
    setImagePreview(null);
  };

  // Open modal for editing student
  const openEditModal = (student: Student) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentStudent(student);
    setFormData({
      id: student.id,
      name: student.name,
      age: student.age,
      classroom: student.classroom,
      birthday: student.birthday,
      parentName: student.parentName,
      parentNIC: student.parentNIC,
      parentEmail: student.parentEmail,
      parentAddress: student.parentAddress,
      parentContact: student.parentContact,
      profileImage: student.profileImage || ''
    });
    setImagePreview(student.profileImage || null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (student: Student) => {
    setIsDeleteModalOpen(true);
    setCurrentStudent(student);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentStudent(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result: Student;
      if (isEditMode && formData.id) {
        result = await updateMockStudent(formData as Student);
        setStudents(students.map(student => student.id === formData.id ? result : student));
        toast.success('Student updated successfully!');
      } else {
        result = await createMockStudent(formData);
        setStudents([...students, result]);
        toast.success('Student added successfully!');
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

  // Delete student
  const deleteStudent = async () => {
    if (!currentStudent) return;
    try {
      await deleteMockStudent(currentStudent.id);
      setStudents(students.filter(student => student.id !== currentStudent.id));
      toast.success('Student deleted successfully!');
      closeModal();
    } catch {
      toast.error('Failed to delete student');
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
            Children
          </span>
        </h1>
      </div>

      {/* Search and Add Student */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, classroom, parent or ID..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Children
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
                            alt={student.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">Age: {student.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                        {student.classroom}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(student.birthday).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.parentName}</div>
                      <div className="text-sm text-gray-500">{student.parentContact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(student)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                        aria-label="Delete"
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
              {isSearching ? 'No matching students found' : 'No students found'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Student
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Student' : 'Add Student'}
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
                  {/* Student Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-700 border-b border-indigo-100 pb-2">
                      Student Information
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
                            title="Remove photo"
                            aria-label="Remove photo"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter student name"
                        title="Student Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="1"
                        max="18"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter student age"
                        title="Enter student age"
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
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                          required
                          placeholder="Select birthday"
                          title="Birthday"
                        />
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-700 border-b border-indigo-100 pb-2">
                      Parent Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter parent name"
                        title="Parent Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent NIC</label>
                      <input
                        type="text"
                        name="parentNIC"
                        value={formData.parentNIC}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter parent NIC"
                        title="Parent NIC"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter parent email"
                        title="Parent Email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent Contact Number</label>
                      <input
                        type="tel"
                        name="parentContact"
                        value={formData.parentContact}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter parent contact number"
                        title="Parent Contact Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent Address</label>
                      <textarea
                        name="parentAddress"
                        value={formData.parentAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter parent address"
                        title="Parent Address"
                      />
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
                    {isEditMode ? 'Update' : 'Add'} Student
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Delete Student</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500" title="Close" aria-label="Close">
                <X className="w-6 h-6" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete student <span className="font-semibold">{currentStudent?.name}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteStudent}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Childrens;