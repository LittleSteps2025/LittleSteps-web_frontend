import { useState, useEffect } from 'react';
import { Calendar, Search, Plus, User, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Appointment = {
  id: string;
  parent: string;
  student: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  notes?: string;
};

// Mock data for appointments
const mockAppointments: Appointment[] = [
  {
    id: 'appointment-001',
    parent: 'malith',
    student: 'damsara',
    date: '2023-05-18',
    time: '10:00 AM',
    status: 'Confirmed',
    notes: 'Discuss math performance'
  },
  {
    id: 'appointment-002',
    parent: 'farshad',
    student: 'mohomad',
    date: '2023-05-19',
    time: '02:30 PM',
    status: 'Pending'
  },
  {
    id: 'appointment-003',
    parent: 'chathumini',
    student: 'silva',
    date: '2023-05-20',
    time: '11:15 AM',
    status: 'Cancelled',
    notes: 'Parent requested cancellation'
  }
];

// Mock API functions
const fetchMockAppointments = async (): Promise<Appointment[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockAppointments]);
    }, 500);
  });
};

const searchMockAppointments = async (term: string): Promise<Appointment[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!term.trim()) {
        resolve([...mockAppointments]);
        return;
      }
      const filtered = mockAppointments.filter(appointment => 
        appointment.parent.toLowerCase().includes(term.toLowerCase()) ||
        appointment.student.toLowerCase().includes(term.toLowerCase()) ||
        appointment.date.includes(term) ||
        appointment.time.toLowerCase().includes(term.toLowerCase()) ||
        appointment.status.toLowerCase().includes(term.toLowerCase()) ||
        appointment.id.toLowerCase().includes(term.toLowerCase())
      );
      resolve(filtered);
    }, 300);
  });
};

const createMockAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newAppointment = { 
        ...appointment, 
        id: `appointment-${Math.floor(1000 + Math.random() * 9000)}`
      };
      mockAppointments.unshift(newAppointment);
      resolve(newAppointment);
    }, 500);
  });
};

const updateMockAppointment = async (appointment: Appointment): Promise<Appointment> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockAppointments.findIndex(a => a.id === appointment.id);
      if (index !== -1) {
        mockAppointments[index] = appointment;
      }
      resolve(appointment);
    }, 500);
  });
};

const deleteMockAppointment = async (id: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockAppointments.findIndex(a => a.id === id);
      if (index !== -1) {
        mockAppointments.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
    parent: '',
    student: '',
    date: '',
    time: '',
    status: 'Pending',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Stats calculation
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length
  };

  // Fetch appointments from mock API
  useEffect(() => {
    fetchAppointments();
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

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMockAppointments();
      setAppointments(data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Search appointments
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchAppointments();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const data = await searchMockAppointments(searchTerm);
      setAppointments(data);
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
      [name]: value
    });
  };

  // Open modal for adding new appointment
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      parent: '',
      student: '',
      date: '',
      time: '',
      status: 'Pending',
      notes: ''
    });
  };

  // Open modal for editing appointment
  const openEditModal = (appointment: Appointment) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentAppointment(appointment);
    setFormData({
      parent: appointment.parent,
      student: appointment.student,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || ''
    });
  };

  // Open delete confirmation modal
  const openDeleteModal = (appointment: Appointment) => {
    setIsDeleteModalOpen(true);
    setCurrentAppointment(appointment);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentAppointment(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result: Appointment;
      if (isEditMode && currentAppointment) {
        const updatedAppointment = {
          ...currentAppointment,
          ...formData
        };
        result = await updateMockAppointment(updatedAppointment);
        setAppointments(appointments.map(a => a.id === result.id ? result : a));
        toast.success('Appointment updated successfully!');
      } else {
        result = await createMockAppointment(formData);
        setAppointments([result, ...appointments]);
        toast.success('Appointment scheduled successfully!');
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

  // Delete appointment
  const deleteAppointment = async () => {
    if (!currentAppointment) return;
    try {
      await deleteMockAppointment(currentAppointment.id);
      setAppointments(appointments.filter(a => a.id !== currentAppointment.id));
      toast.success('Appointment deleted successfully!');
      closeModal();
    } catch {
      toast.error('Failed to delete appointment');
    }
  };

  // Update appointment status
  const updateStatus = async (id: string, newStatus: 'Confirmed' | 'Cancelled') => {
    try {
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        const updatedAppointment = { ...appointment, status: newStatus };
        await updateMockAppointment(updatedAppointment);
        setAppointments(appointments.map(a => a.id === id ? updatedAppointment : a));
        toast.success(`Appointment ${newStatus.toLowerCase()} successfully!`);
      }
    } catch {
      toast.error(`Failed to ${newStatus.toLowerCase()} appointment`);
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
            Appointments
          </span>
        </h1>
      </div>

      {/* Search and Add Appointment */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments by parent, student, date or status..."
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
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Total Appointments</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Confirmed</h3>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Cancelled</h3>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent/Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.parent}</div>
                          <div className="text-sm text-gray-500">{appointment.student}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {appointment.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(appointment.id, 'Confirmed')}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(appointment.id, 'Cancelled')}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'Confirmed' && (
                        <button
                          onClick={() => openEditModal(appointment)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Reschedule
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(appointment)}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
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
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {isSearching ? 'No matching appointments found' : 'No appointments found'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Appointment
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Appointment' : 'Schedule New Appointment'}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                    <input
                      type="text"
                      name="parent"
                      value={formData.parent}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="Enter parent name"
                      title="Parent Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input
                      type="text"
                      name="student"
                      value={formData.student}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="Enter student name"
                      title="Student Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="Select date"
                      title="Select appointment date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="Select time"
                      title="Select appointment time"
                    />
                  </div>

                  {isEditMode && (
                    <div>
                      <label htmlFor="appointment-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        id="appointment-status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add any notes about the appointment"
                    title="Appointment notes"
                  />
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
                    {isEditMode ? 'Update' : 'Schedule'} Appointment
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
                Are you sure you want to delete the appointment with <span className="font-semibold">{currentAppointment?.parent}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAppointment}
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

export default Appointments;