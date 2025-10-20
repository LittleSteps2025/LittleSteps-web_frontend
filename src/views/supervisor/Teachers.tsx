import { useState, useEffect } from "react";
import { Search, Plus, Mail, Phone, Edit, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userImg from "../../assets/user.png";
import { API_BASE_URL } from "../../config/api";

type Teacher = {
  id: number;
  teacher_id?: number;
  name: string;
  email: string;
  nic?: number;
  address?: string;
  phone?: number;
  image?: string;
  cv?: string;
  group_id?: number;
  group_name?: string;
  role: string;
  status: string;
  created_at: string;
};

type CreateTeacherRequest = {
  name: string;
  email: string;
  password: string;
  nic?: number;
  address?: string;
  phone?: number;
  image?: string;
  cv?: string;
  group_id?: number;
};

type AvailableGroup = {
  group_id: number;
  name: string;
  age_category: number;
  available_position: "main_teacher" | "co_teacher" | "full";
  main_teacher_id?: number;
  co_teacher_id?: number;
};

// API Base URL
const TEACHERS_API_URL = `${API_BASE_URL}/teachers`;

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  teachers?: T[];
  teacher?: T;
  user?: T;
  groups?: AvailableGroup[];
  count?: number;
  searchTerm?: string;
}

// API functions
const teacherApi = {
  // Create a new teacher
  async createTeacher(
    teacherData: CreateTeacherRequest
  ): Promise<ApiResponse<Teacher>> {
    const response = await fetch(`${TEACHERS_API_URL}/teacherRegister`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get all teachers
  async getAllTeachers(): Promise<ApiResponse<Teacher>> {
    const response = await fetch(`${TEACHERS_API_URL}/teachers`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Search teachers
  async searchTeachers(searchTerm: string): Promise<ApiResponse<Teacher>> {
    const response = await fetch(
      `${TEACHERS_API_URL}/teachers/search?search=${encodeURIComponent(
        searchTerm
      )}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get teacher by ID
  async getTeacherById(id: number): Promise<ApiResponse<Teacher>> {
    const response = await fetch(`${TEACHERS_API_URL}/teachers/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get available groups for teacher assignment
  async getAvailableGroups(): Promise<ApiResponse<Teacher>> {
    const response = await fetch(`${TEACHERS_API_URL}/available-groups`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update teacher
  async updateTeacher(
    id: number,
    teacherData: Partial<CreateTeacherRequest>
  ): Promise<ApiResponse<Teacher>> {
    const response = await fetch(`${TEACHERS_API_URL}/teachers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Delete teacher
  async deleteTeacher(id: number): Promise<ApiResponse<Teacher>> {
    const response = await fetch(`${TEACHERS_API_URL}/teachers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
};

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<AvailableGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [formData, setFormData] = useState<CreateTeacherRequest>({
    name: "",
    email: "",
    password: "teacher@123", // Default password
    nic: undefined,
    address: "",
    phone: undefined,
    image: "",
    cv: "",
    group_id: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch teachers from mock API
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else if (isSearching) {
        fetchTeachers();
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await teacherApi.getAllTeachers();
      if (response.success) {
        setTeachers(response.teachers || []);
      } else {
        toast.error(response.message || "Failed to load teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
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
      const response = await teacherApi.searchTeachers(searchTerm);
      if (response.success) {
        setTeachers(response.teachers || []);
      } else {
        toast.error(response.message || "Search failed");
      }
    } catch (error) {
      console.error("Error searching teachers:", error);
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "nic" || name === "phone" || name === "group_id"
          ? value
            ? parseInt(value)
            : undefined
          : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode && currentTeacher) {
        // Update existing teacher (exclude password from update)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...updateData } = formData;
        const response = await teacherApi.updateTeacher(
          currentTeacher.id,
          updateData
        );
        if (response.success) {
          toast.success("Teacher updated successfully!");
          closeModal();
          fetchTeachers(); // Refresh the list
        } else {
          toast.error(response.message || "Failed to update teacher");
        }
      } else {
        // Create new teacher
        const response = await teacherApi.createTeacher(formData);
        if (response.success) {
          toast.success("Teacher added successfully!");
          closeModal();
          fetchTeachers(); // Refresh the list
        } else {
          toast.error(response.message || "Failed to add teacher");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save teacher");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete teacher function (placeholder)
  const deleteTeacher = async () => {
    if (!currentTeacher) return;
    setIsLoading(true);
    try {
      const response = await teacherApi.deleteTeacher(currentTeacher.id);
      if (response.success) {
        toast.success("Teacher deleted successfully!");
        closeModal();
        fetchTeachers(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete teacher");
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Failed to delete teacher");
    } finally {
      setIsLoading(false);
    }
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentTeacher(null);
  };

  // Fetch available groups for teacher assignment
  const fetchAvailableGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const response = await teacherApi.getAvailableGroups();
      if (response.success) {
        setAvailableGroups(response.groups || []);
      } else {
        console.error("Failed to fetch available groups:", response.message);
        setAvailableGroups([]);
      }
    } catch (error) {
      console.error("Error fetching available groups:", error);
      setAvailableGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Open modal for adding new teacher
  const openAddModal = async () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      name: "",
      email: "",
      password: "teacher@123", // Default password
      nic: undefined,
      address: "",
      phone: undefined,
      image: "",
      cv: "",
      group_id: undefined,
    });

    // Fetch available groups when opening the modal
    await fetchAvailableGroups();
  };

  // Open modal for editing teacher
  const openEditModal = (teacher: Teacher) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: "", // Don't pre-fill password for editing
      nic: teacher.nic,
      address: teacher.address || "",
      phone: teacher.phone,
      image: teacher.image || "",
      cv: teacher.cv || "",
      group_id: teacher.group_id,
    });
  };

  // Open delete confirmation modal
  const openDeleteModal = (teacher: Teacher) => {
    setIsDeleteModalOpen(true);
    setCurrentTeacher(teacher);
  };

  // Handle form submission

  // Delete teacher

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <img
                            src={
                              teacher.image && teacher.image.trim() !== ""
                                ? teacher.image
                                : userImg
                            }
                            alt={teacher.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = userImg;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {teacher.id}
                          </div>
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
                        {teacher.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>
                          <strong>NIC:</strong> {teacher.nic || "N/A"}
                        </div>
                        <div>
                          <strong>Address:</strong> {teacher.address || "N/A"}
                        </div>
                        {teacher.group_name && (
                          <div>
                            <strong>Group:</strong> {teacher.group_name}
                          </div>
                        )}
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
              {isSearching ? "No matching teachers found" : "No teachers found"}
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? "Edit Teacher" : "Add New Teacher"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 bg-white rounded-lg shadow-sm p-6 "
              >
                <div>
                  {/* Teacher Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-700 border-b border-indigo-100 pb-2">
                      Teacher Information
                    </h3>

                    <div className="flex flex-row gap-10 justify-between">
                      <div className="flex-1 flex flex-col gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1 hidden">
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={"teacher@123"}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden"
                            required={!isEditMode}
                            minLength={6}
                            placeholder={
                              isEditMode
                                ? "Leave blank to keep current password"
                                : "Enter password (min 6 characters)"
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            NIC *
                          </label>
                          <input
                            type="number"
                            name="nic"
                            value={formData.nic || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter NIC number"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                            placeholder="Enter address"
                          />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter phone number"
                          />
                        </div>

                        {/* <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CV URL (Optional)
                          </label>
                          <input
                            type="url"
                            name="cv"
                            value={formData.cv || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter CV URL"
                          />
                        </div> */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 hidden">
                            Profile Image URL (Optional)
                          </label>
                          <input
                            type="url"
                            name="image"
                            value={
                              formData.image ||
                              "https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/"
                            }
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden"
                            placeholder="Enter profile image URL"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign to Group (Optional)
                          </label>
                          {isLoadingGroups ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                              Loading available groups...
                            </div>
                          ) : availableGroups.length === 0 ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                              No groups available for assignment
                            </div>
                          ) : (
                            <select
                              name="group_id"
                              value={formData.group_id || ""}
                              onChange={handleInputChange}
                              aria-label="Select group for teacher assignment"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">
                                Select a group (optional)
                              </option>
                              {availableGroups.map((group) => (
                                <option
                                  key={group.group_id}
                                  value={group.group_id}
                                >
                                  {group.name} (Age: {group.age_category}) -
                                  {group.available_position === "main_teacher"
                                    ? " Main Teacher"
                                    : " Co-Teacher"}{" "}
                                  position
                                </option>
                              ))}
                            </select>
                          )}
                          {availableGroups.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Only groups with available teacher positions are
                              shown
                            </p>
                          )}
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
                            {isEditMode ? "Update" : "Add"} Teacher
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Confirm Deletion
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <p className="mb-6 text-gray-600">
                Are you sure you want to delete teacher{" "}
                <span className="font-semibold">{currentTeacher?.name}</span>?
                This action cannot be undone.
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
