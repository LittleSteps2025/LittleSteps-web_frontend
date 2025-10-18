import { useState, useEffect } from "react";
import { Users, Search, Trash2, Send, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
// import { redirect } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const API_PARENTS = `${API_BASE_URL}/supervisors/child/parent`;

type Parent = {
  id: string;
  nic: string;
  name: string;
  email: string;
  phone: string;
  children: number;
  profile_image: string;
  created_at: string;
};

// API Response interface to match backend
interface ApiParent {
  user_id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  phone_number: string;
  address: string;
  nic: string;
  profile_picture: string;
  created_at: string;
  updated_at: string;
  child_count: number;
}

// type ValidationErrors = {
//   nic?: string;
//   name?: string;
//   email?: string;
//   phone?: string;
//   children?: string;
//   profile_image?: string;
// };

const Parents = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch parents from API
  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_PARENTS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiParent[] = await response.json();
      console.log("Raw API response:", data);

      // Transform API response to match Parent interface
      const transformedParents: Parent[] = data.map((apiParent: ApiParent) => ({
        id: apiParent.user_id,
        nic: apiParent.nic || "",
        name: apiParent.username || "",
        email: apiParent.email || "",
        phone: apiParent.phone_number || "",
        children: apiParent.child_count || 0,
        profile_image: apiParent.profile_picture || "",
        created_at: apiParent.created_at || new Date().toISOString(),
      }));

      console.log("Transformed parents:", transformedParents);
      setParents(transformedParents);
    } catch (error) {
      console.error("Error fetching parents:", error);
      toast.error("Failed to load parents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Handle input changes for form
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: name === "children" ? Number(value) : value,
  //   });
  // };

  // Handle image upload
  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFormData({
  //         ...formData,
  //         profile_image: reader.result as string,
  //       });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // Validate form
  // const validateForm = () => {
  //   const errors: ValidationErrors = {};

  //   if (!formData.nic.trim()) errors.nic = "NIC is required";
  //   if (!formData.name.trim()) errors.name = "Name is required";
  //   if (!formData.email.trim()) errors.email = "Email is required";
  //   else if (!/^\S+@\S+\.\S+$/.test(formData.email))
  //     errors.email = "Invalid email format";
  //   if (!formData.phone.trim()) errors.phone = "Phone is required";
  //   if (!formData.children || formData.children < 1)
  //     errors.children = "Must have at least 1 child";

  //   setValidationErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };

  // Open modal for adding new parent

  // Open modal for editing parent
  // const openEditModal = (parent: Parent) => {
  //   setIsModalOpen(true);
  //   setIsEditMode(true);
  //   setCurrentParent(parent);
  //   setFormData({
  //     nic: parent.nic,
  //     name: parent.name,
  //     email: parent.email,
  //     phone: parent.phone,
  //     children: parent.children,
  //     profile_image: parent.profile_image,
  //   });
  //   setValidationErrors({});
  // };

  // Open delete confirmation modal
  const openDeleteModal = (parent: Parent) => {
    setIsDeleteModalOpen(true);
    setCurrentParent(parent);
  };

  // Open send message modal
  // const openSendModal = (parent: Parent) => {
  //   setIsSendModalOpen(true);
  //   setCurrentParent(parent);
  //   setMessage("");
  // };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsSendModalOpen(false);
    setCurrentParent(null);
    // setValidationErrors({});
  };

  // Handle form submission
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   try {
  //     // In a real app, you would submit to your API
  //     // const token = localStorage.getItem('token');
  //     // let response;
  //     // if (isEditMode && currentParent) {
  //     //   response = await fetch(`/api/parents/${currentParent.id}`, {
  //     //     method: 'PUT',
  //     //     headers: {
  //     //       'Content-Type': 'application/json',
  //     //       'Authorization': `Bearer ${token}`,
  //     //     },
  //     //     body: JSON.stringify(formData),
  //     //   });
  //     // } else {
  //     //   response = await fetch('/api/parents', {
  //     //     method: 'POST',
  //     //     headers: {
  //     //       'Content-Type': 'application/json',
  //     //       'Authorization': `Bearer ${token}`,
  //     //     },
  //     //     body: JSON.stringify(formData),
  //     //   });
  //     // }
  //     // const result = await response.json();

  //     // Simulating API response
  //     const newParent = {
  //       id: `P${Math.floor(1000 + Math.random() * 9000)}`,
  //       ...formData,
  //       created_at: new Date().toISOString(),
  //     };

  //     if (isEditMode && currentParent) {
  //       setParents(
  //         parents.map((p) =>
  //           p.id === currentParent.id ? { ...currentParent, ...formData } : p
  //         )
  //       );
  //       toast.success("Parent updated successfully!");
  //     } else {
  //       setParents([newParent, ...parents]);
  //       toast.success("Parent added successfully!");
  //     }
  //     closeModal();
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       toast.error(error.message || "An error occurred");
  //     } else {
  //       toast.error("An error occurred");
  //     }
  //   }
  // };

  // Delete parent
  const deleteParent = async () => {
    if (!currentParent) return;
    try {
      const response = await fetch(`${API_PARENTS}/${currentParent.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove parent from local state
      setParents(parents.filter((parent) => parent.id !== currentParent.id));
      toast.success("Parent deleted successfully!");
      closeModal();
    } catch (error) {
      console.error("Error deleting parent:", error);
      toast.error("Failed to delete parent");
    }
  };

  // Send message to parent
  const sendMessage = async () => {
    if (!currentParent || !message.trim()) return;
    try {
      // In a real app, integrate with SMS/email service
      console.log(`Sending message to ${currentParent.phone}: ${message}`);
      toast.success(`Message sent to ${currentParent.name}`);
      closeModal();
    } catch {
      toast.error("Failed to send message");
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
    <div className="space-y-6 p-4">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
              Parents
            </span>
          </h1>
          {!isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              {parents.length} parent{parents.length !== 1 ? "s" : ""} found
              {searchTerm && (
                <span>
                  {" "}
                  •{" "}
                  {
                    parents.filter((parent) => {
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        parent.name.toLowerCase().includes(searchLower) ||
                        parent.email.toLowerCase().includes(searchLower) ||
                        parent.phone.toLowerCase().includes(searchLower) ||
                        parent.nic.toLowerCase().includes(searchLower)
                      );
                    }).length
                  }{" "}
                  matching search
                </span>
              )}
            </p>
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search parents by name, email, phone, or NIC..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchParents}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
              <p className="text-gray-600">Loading parents...</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Children
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parents.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No parents found</p>
                      <p className="text-sm">
                        Try refreshing the page or check your connection
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                parents
                  .filter((parent) => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      parent.name.toLowerCase().includes(searchLower) ||
                      parent.email.toLowerCase().includes(searchLower) ||
                      parent.phone.toLowerCase().includes(searchLower) ||
                      parent.nic.toLowerCase().includes(searchLower)
                    );
                  })
                  .map((parent) => (
                    <tr key={parent.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {parent.profile_image ? (
                              <img
                                src={parent.profile_image}
                                alt={parent.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {parent.nic}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {parent.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined:{" "}
                          {new Date(parent.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {parent.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {parent.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {parent.children}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* <button
                        onClick={() => openEditModal(parent)}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button> */}
                          {/* <button
                            onClick={() => redirect}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded-md hover:bg-green-50 transition-colors"
                            title="Send Message"
                          >
                            <Send className="w-4 h-4" />
                          </button> */}
                          <button
                            onClick={() => openDeleteModal(parent)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
                {/* <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? "Edit Parent" : "Add New Parent"}
                </h2> */}
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIC Number
                    </label>
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.nic
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="NIC number"
                    />
                    {validationErrors.nic && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.nic}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.name
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="Parent's full name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.name}
                      </p>
                    )}
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
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.email
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="parent@example.com"
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.phone
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="Phone number"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Children
                    </label>
                    <input
                      type="number"
                      name="children"
                      min="1"
                      value={formData.children}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.children
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="Number of children"
                    />
                    {validationErrors.children && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.children}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.profile_image ? (
                        <img
                          src={formData.profile_image}
                          alt="Profile preview"
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        Choose Image
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isEditMode ? "Update Parent" : "Add Parent"}
                  </button>
                  </div>
                </form> */}
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
                  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mb-6 text-gray-600">
                Are you sure you want to delete parent{" "}
                <span className="font-semibold text-gray-800">
                  {currentParent?.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteParent}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Send Message
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  {currentParent?.profile_image ? (
                    <img
                      src={currentParent.profile_image}
                      alt={currentParent.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {currentParent?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentParent?.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
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
