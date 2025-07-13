import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Calendar, Edit, Trash2, Plus } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  age: number;
  classroom: string;
  birthday: string;
  gender: string;
  parentName: string;
  parentNIC: string;
  parentEmail: string;
  parentAddress: string;
  parentContact: string;
  profileImage?: string;
}

const API_URL = 'http://localhost:5001/api/child/';

const fetchStudents = async (): Promise<Student[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch students');
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.child_id,
    name: item.name,
    age: item.age,
    classroom: item.group_id,
    birthday: item.dob,
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
      dob: student.birthday,
      group_id: null,
      image: student.profileImage ? student.profileImage : null,
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
    birthday: item.dob,
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
      dob: student.birthday,
      group_id: null,
      image: student.profileImage ? student.profileImage : null,
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
    birthday: item.dob,
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
    name: '', age: 1, classroom: '', birthday: '', gender: '',
    parentName: '', parentNIC: '', parentEmail: '', parentAddress: '', parentContact: '', profileImage: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm({ name: '', age: 1, classroom: '', birthday: '', gender: '', parentName: '', parentNIC: '', parentEmail: '', parentAddress: '', parentContact: '', profileImage: '' });
      setEditingId(null);
      await loadStudents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (student: Student) => {
    const { id, ...rest } = student;
    setForm(rest);
    setEditingId(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudentApi(id);
      toast.success('Deleted successfully');
      await loadStudents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <User className="mr-2 text-[#4f46e5]" size={24} />
          Children Management
        </h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(form).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                name={key}
                value={value as string}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type={key === 'age' ? 'number' : key === 'birthday' ? 'date' : 'text'}
                min={key === 'age' ? 1 : undefined}
                required
              />
            </div>
          ))}
          <div className="flex items-end">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {editingId ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birthday</th>
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
                      {student.birthday}
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
    </div>
  );
}