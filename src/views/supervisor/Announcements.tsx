import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit, X, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Assuming you have an auth context
import { API_BASE_URL } from "../../config/api";

type Announcement = {
  ann_id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  audience: "All" | "Teachers" | "Parents";
  created_at: string;
  attachment?: string;
  session_id?: string;
  user_id: string;
  updated_at?: string;
};

// Audience mapping
const audienceMap: { [key: number]: string } = {
  1: "All",
  2: "Teachers",
  3: "Parents",
};

const audienceReverseMap = {
  All: 1,
  Teachers: 2,
  Parents: 3,
};

// Toast notification component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      <div className="flex items-center">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200"
          title="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Announcements = () => {
  const { user } = useAuth(); // Get current user from auth context
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Announcement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<
    Omit<Announcement, "ann_id" | "created_at" | "session_id">
  >({
    title: "",
    details: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5), // HH:MM format only
    audience: "All",
    user_id: user?.id ? String(user.id) : "",
    attachment: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Calculate date for announcement (today only)
  const today = new Date().toISOString().split("T")[0];

  // API base URL
  const ANNOUNCEMENTS_API_URL = `${API_BASE_URL}/announcements`;

  // Update formData when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        user_id: String(user.id),
      }));
    }
  }, [user?.id]);

  // Format date without timezone issues
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    // Extract just the date part (YYYY-MM-DD) to avoid timezone conversion issues
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return dateString;
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(ANNOUNCEMENTS_API_URL);
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const result = await response.json();
      const data = result.data || []; // Extract the data array from the response
      // Map audience integer to string
      const mappedData = data.map((a: { audience: string | number }) => ({
        ...a,
        audience: audienceMap[Number(a.audience)] || "All",
      }));
      setAnnouncements(mappedData);
      setFilteredAnnouncements(mappedData);
    } catch (error) {
      showToast("Failed to load announcements", "error");
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [ANNOUNCEMENTS_API_URL]);

  // Search announcements with debounce
  const searchAnnouncements = useCallback(() => {
    if (!searchTerm && !searchDate) {
      setFilteredAnnouncements(announcements);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      const filtered = announcements.filter((announcement) => {
        const termMatch = searchTerm
          ? announcement.title
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            announcement.details
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : true;

        const dateMatch = searchDate
          ? announcement.date &&
            typeof announcement.date === "string" &&
            formatDate(announcement.date).includes(searchDate)
          : true;

        return termMatch && dateMatch;
      });

      setFilteredAnnouncements(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDate, announcements]);

  // Create announcement
  const createAnnouncement = async (
    announcement: Omit<Announcement, "ann_id" | "created_at">
  ) => {
    const response = await fetch(ANNOUNCEMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...announcement,
        audience: audienceReverseMap[announcement.audience] || 1,
        // Don't explicitly send session_id - let backend handle it
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create announcement");
    }

    return await response.json();
  };

  // Update announcement
  const updateAnnouncement = async (
    id: string,
    announcement: Partial<Announcement>
  ) => {
    interface UserWithSession {
      session_id?: string | number;
    }
    const userWithSession = user as UserWithSession;
    const sessionId =
      typeof userWithSession?.session_id === "number"
        ? userWithSession.session_id
        : userWithSession?.session_id
        ? Number(userWithSession.session_id)
        : null;

    const payload = {
      ...announcement,
      audience:
        audienceReverseMap[
          announcement.audience as "All" | "Teachers" | "Parents"
        ] || 1,
      session_id: sessionId,
    };

    const response = await fetch(`${ANNOUNCEMENTS_API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update announcement");
    }

    return await response.json();
  };

  // Delete announcement
  const deleteAnnouncement = async (id: string) => {
    const response = await fetch(`${ANNOUNCEMENTS_API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete announcement");
    }

    return await response.json();
  };

  // Effect to fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Effect to handle search when search term or date changes
  useEffect(() => {
    searchAnnouncements();
  }, [searchTerm, searchDate, searchAnnouncements]);

  // Handle input changes for form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open modal for adding new announcement
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      title: "",
      details: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5), // HH:MM format only
      audience: "All",
      user_id: user?.id ? String(user.id) : "",
      attachment: "",
    });
  };

  // Open modal for editing announcement
  const openEditModal = (announcement: Announcement) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      details: announcement.details,
      date: formatDate(announcement.date), // Format date properly to YYYY-MM-DD
      time: typeof announcement.time === 'string' 
        ? announcement.time.slice(0, 5)  // Ensure HH:MM format only
        : announcement.time,
      audience: announcement.audience,
      user_id: announcement.user_id ? String(announcement.user_id) : "",
      attachment: announcement.attachment || "",
    });
  };

  // Open delete confirmation modal

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentAnnouncement(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title.trim() ||
      !formData.details.trim() ||
      !formData.date ||
      !formData.user_id
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // Validate date is today only - but only when creating new announcements
    if (!isEditMode) {
      const selectedDate = new Date(formData.date);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() !== todayDate.getTime()) {
        showToast("Can only create announcements for today", "error");
        return;
      }
    }

    if (!user) {
      showToast("You must be logged in to create announcements", "error");
      return;
    }

    try {
      let result: Announcement;
      if (isEditMode && currentAnnouncement) {
        result = await updateAnnouncement(currentAnnouncement.ann_id, {
          ...formData,
        });
        setAnnouncements(
          announcements.map((a) => (a.ann_id === result.ann_id ? result : a))
        );
        showToast("Announcement updated successfully!", "success");
      } else {
        result = await createAnnouncement({
          ...formData,
        });
        setAnnouncements([result, ...announcements]);
        showToast("Announcement added successfully!", "success");
      }
      closeModal();
      fetchAnnouncements();
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message || "An error occurred", "error");
      } else {
        showToast("An error occurred", "error");
      }
    }
  };

  // Handle delete announcement
  const handleDelete = async () => {
    if (!currentAnnouncement) return;
    try {
      await deleteAnnouncement(currentAnnouncement.ann_id);
      setAnnouncements(
        announcements.filter((a) => a.ann_id !== currentAnnouncement.ann_id)
      );
      showToast("Announcement deleted successfully!", "success");
      closeModal();
      fetchAnnouncements();
    } catch {
      showToast("Failed to delete announcement", "error");
    }
  };

  // Clear search filters
  const clearFilters = () => {
    setSearchTerm("");
    setSearchDate("");
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
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Announcements
          </span>
        </h1>
        {(user as { session_id?: string | number })?.session_id && (
          <span className="text-sm text-gray-500">
            Session: {(user as { session_id?: string | number }).session_id}
          </span>
        )}
      </div>

      {/* Search and Add Announcement */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by topic or content..."
                className="pl-10 pr-10 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isSearching && (
                <span className="absolute right-3 top-3">
                  <svg
                    className="animate-spin h-5 w-5 text-indigo-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </span>
              )}
            </div>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                placeholder="Filter by date..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="btn-primary flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </button>
          </div>

          {(searchTerm || searchDate) && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {filteredAnnouncements.length} results
                {searchTerm && ` for "${searchTerm}"`}
                {searchDate && ` on ${searchDate}`}
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {filteredAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => {
              return (
                <div
                  key={announcement.ann_id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {announcement.details}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          To: {announcement.audience}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Date: {formatDate(announcement.date)}
                        </span>
                        {announcement.time && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Time:{" "}
                            {typeof announcement.time === "string"
                              ? announcement.time.slice(0, 5)
                              : announcement.time}
                          </span>
                        )}
                        {announcement.session_id && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {/* Session: {announcement.session_id} */}
                          </span>
                        )}
                        {announcement.attachment && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Attachment
                            {/* Attachment: {announcement.attachment} */}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      {/* <Clock className="w-3 h-3 mr-1" />
                      <span>Posted: {createdDateTime.date} at {createdDateTime.time}</span> */}
                    </div>
                    {announcement.updated_at && (
                      <div className="flex items-center mt-1">
                        <span>
                          Updated:{" "}
                          {formatDateTime(announcement.updated_at).date} at{" "}
                          {formatDateTime(announcement.updated_at).time}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex mt-4 space-x-3">
                    <button
                      onClick={() => openEditModal(announcement)}
                      className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    {/* <button
                      onClick={() => openDeleteModal(announcement)}
                      className="text-red-600 hover:text-red-900 flex items-center text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {isSearching
                ? "Searching..."
                : searchTerm || searchDate
                ? "No matching announcements found"
                : "No announcements found"}
            </p>
            {searchTerm || searchDate ? (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Clear search filters
              </button>
            ) : (
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Announcement
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? "Edit Announcement" : "New Announcement"}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter a title"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details*
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    placeholder="Enter announcement details"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audience*
                  </label>
                  <select
                    name="audience"
                    value={formData.audience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    title="Select target audience"
                  >
                    <option value="All">All</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={today}
                      max={today}
                      readOnly={isEditMode}
                      disabled={isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      required
                      title={isEditMode ? "Date cannot be changed" : "Select announcement date (today only)"}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {isEditMode ? "Date cannot be changed" : "Today only"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time*
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      title="Select announcement time"
                    />
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>

                  <input
                    type="file"
                    name="attachment"
                    accept="*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, attachment: file.name });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Upload an attachment"
                  />
                  {formData.attachment && (
                    <p className="mt-1 text-sm text-gray-500">
                      Selected: {formData.attachment}
                    </p>
                  )}
                </div> */}

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
                    {isEditMode ? "Update" : "Create"} Announcement
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
                Are you sure you want to delete announcement{" "}
                <span className="font-semibold">
                  "{currentAnnouncement?.title}"
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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

export default Announcements;
