import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Calendar, Edit, Trash2, Plus } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  age: number;
  classroom: string;
  dob: string;
  gender: string;
  parentName: string;
  parentNIC: string;
  parentEmail: string;
  parentAddress: string;
  parentContact: string;
  profileImage?: string;
}

interface ApiStudent {
  child_id: string;
  name: string;
  age: number;
  group_id: string;
  dob: string;
  gender: string;
  parent_name: string;
  nic?: string;
  parent_email: string;
  parent_address: string;
  parent_phone: string;
  image?: string;
}

const API_URL = 'http://localhost:5001/api/supervisors/child/';

const fetchStudents = async (): Promise<Student[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch students');
  const data: ApiStudent[] = await res.json();
  console.log('Students fetched successfully', data);
  return data.map((item: ApiStudent) => ({
    id: item.child_id,
    name: item.name,
    age: item.age,
    classroom: item.group_id,
    dob: item.dob,
    gender: item.gender,
    parentName: item.parent_name,
    parentNIC: item.nic || '',
    parentEmail: item.parent_email,
    parentAddress: item.parent_address,
    parentContact: item.parent_phone,
    profileImage: item.image,
  }));
};

const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: student.name,
      age: student.age,
      gender: student.gender,
      dob: student.dob,
      group_id: null,
      image: null,
      bc: null,
      blood_type: null,
      mr: null,
      allergies: null,
      created_at: new Date().toISOString(),
      package_id: null,
      parentName: student.parentName,
      parentNIC: student.parentNIC,
      parentEmail: student.parentEmail,
      parentAddress: student.parentAddress,
      parentContact: student.parentContact,
    }),
  });
  if (!res.ok) throw new Error('Failed to create student');
  const item = await res.json();
  return {
    id: item.child_id,
    name: item.name,
    age: item.age,
    classroom: item.group_id,
    dob: item.dob,
    gender: item.gender,
    parentName: student.parentName,
    parentNIC: student.parentNIC,
    parentEmail: student.parentEmail,
    parentAddress: student.parentAddress,
    parentContact: student.parentContact,
    profileImage: item.image,
  };
};

const updateStudent = async (student: Student): Promise<Student> => {
  const res = await fetch(`${API_URL}${student.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: student.name,
      age: student.age,
      gender: student.gender,
      dob: student.dob,
      group_id: null,
      image: null,
      bc: null,
      blood_type: null,
      mr: null,
      allergies: null,
      created_at: new Date().toISOString(),
      package_id: null,
    })
  });
  if (!res.ok) throw new Error('Failed to update student');
  const item = await res.json();
  return {
    id: item.child_id,
    name: item.name,
    age: item.age,
    classroom: item.group_id,
    dob: item.dob,
    gender: item.gender,
    parentName: student.parentName,
    parentNIC: student.parentNIC,
    parentEmail: student.parentEmail,
    parentAddress: student.parentAddress,
    parentContact: student.parentContact,
    profileImage: item.image,
  };
};

const deleteStudentApi = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete student');
};

export default function Childrens() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Omit<Student, 'id'>>({
    name: '', age: 1, classroom: '', dob: '', gender: '',
    parentName: '', parentNIC: '', parentEmail: '', parentAddress: '', parentContact: '', 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadStudents = async () => {
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'age' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateStudent({ ...form, id: editingId });
        toast.success('Updated successfully');
      } else {
        await createStudent(form);
        toast.success('Created successfully');
      }
      setForm({ name: '', age: 1, classroom: '', dob: '', gender: '', parentName: '', parentNIC: '', parentEmail: '', parentAddress: '', parentContact: '',  });
      setEditingId(null);
      setShowAddForm(false);
      await loadStudents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (student: Student) => {
    const { id, ...rest } = student;
    setForm(rest);
    setEditingId(id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudentApi(id);
      toast.success('Deleted successfully');
      await loadStudents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  const openAddModal = () => {
    setShowAddForm(true);
    setForm({ name: '', age: 1, classroom: '', dob: '', gender: '', parentName: '', parentNIC: '', parentEmail: '', parentAddress: '', parentContact: '',  });
    setEditingId(null);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setForm({ name: '', age: 1, classroom: '', dob: '', gender: '', parentName: '', parentNIC: '', parentEmail: '', parentAddress: '', parentContact: '',  });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <User className="mr-2 text-[#4f46e5]" size={24} />
          Children Management
        </h1>
        {!showAddForm && (
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Child
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingId ? 'Edit Child' : 'Add New Child'}
            </h2>
            {/* <button
              onClick={closeModal}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Back to List
            </button> */}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Child Information Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-blue-600" size={20} />
                Child Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Child Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="text"
                    required
                    placeholder="Enter child's name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age *
                  </label>
                  <input
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="number"
                    min={1}
                    max={18}
                    required
                    placeholder="Enter child's age"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    dob *
                  </label>
                  <input
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="date"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Classroom
                  </label>
                  <input
                    name="classroom"
                    value={form.classroom}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="text"
                    placeholder="Enter classroom (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Parent Information Section */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-green-600" size={20} />
                Parent Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Name *
                  </label>
                  <input
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="text"
                    required
                    placeholder="Enter parent's name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent NIC
                  </label>
                  <input
                    name="parentNIC"
                    value={form.parentNIC}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="text"
                    placeholder="Enter parent's NIC"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Email *
                  </label>
                  <input
                    name="parentEmail"
                    value={form.parentEmail}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="email"
                    required
                    placeholder="Enter parent's email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Contact *
                  </label>
                  <input
                    name="parentContact"
                    value={form.parentContact}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="tel"
                    required
                    placeholder="Enter parent's contact number"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Address *
                  </label>
                  <textarea
                    name="parentAddress"
                    value={form.parentAddress}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    required
                    placeholder="Enter parent's address"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingId ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Child
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Child
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">dob</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.profileImage ? (
                          <img 
                            src={student.profileImage} 
                            alt={student.name}
                            className="flex-shrink-0 h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.classroom || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="mr-2 text-gray-400" size={14} />
                        {student.dob}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.parentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}