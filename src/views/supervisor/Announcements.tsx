import { useState, useEffect, useCallback } from "react";
import { Search, Plus, X, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Assuming you have an auth context
import { API_BASE_URL } from "../../config/api";

type Announcement = {
  ann_id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  audience: "All" | "Teachers" | "Parents" | number | 1 | 2 | 3;
  created_at: string;
  attachment?: string;
  session_id?: string;
  user_id: string;
  updated_at?: string;
};

// API Response interface
interface ApiAnnouncement {
  ann_id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  audience?: number;
  created_at?: string;
  attachment?: string;
  session_id?: string;
  user_id?: string;
  updated_at?: string;
}

// API Response wrapper
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

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
  
  // Helper function to get local date in YYYY-MM-DD format
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
  const [formData, setFormData] = useState<
    Omit<Announcement, "ann_id" | "created_at" | "session_id">
  >(() => {
    const now = new Date();
    return {
      title: "",
      details: "",
      date: getLocalDateString(), // Use local date, not UTC
      time: now.toTimeString().slice(0, 5), // HH:MM format only
      audience: "All",
      user_id: user?.id ? String(user.id) : "",
      attachment: "",
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // Format date without timezone issues (returns YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    // Extract just the date part (YYYY-MM-DD) to avoid timezone conversion issues
    if (typeof dateString === "string" && dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return String(dateString);
  };

  // Format date for display in cards - avoiding timezone issues
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      // Parse as UTC to avoid timezone shift
      let date: Date;
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // If it's already in YYYY-MM-DD format, parse it as UTC
        date = new Date(dateString + 'T00:00:00Z');
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return String(dateString);
      }
      
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: 'UTC' // Use UTC to match backend
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return String(dateString);
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: "N/A", time: "N/A" };
    
    try {
      // Parse as UTC to avoid timezone shift
      let date: Date;
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString + 'T00:00:00Z');
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return { date: "Invalid Date", time: "N/A" };
      }
      
      return {
        date: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: 'UTC'
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: 'UTC'
        }),
      };
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return { date: String(dateString), time: "N/A" };
    }
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
      // Handle both wrapped response {data: [...]} and direct array response [...]
      const data = Array.isArray(result) ? result : result.data || [];

      // Map API data to Announcement interface, providing defaults for missing fields
      const mappedData = data.map((a: ApiAnnouncement, index: number) => {
        // Ensure audience is properly converted from number to string
        const audienceValue = a.audience !== undefined && a.audience !== null 
          ? Number(a.audience) 
          : 1; // Default to 1 (All) if undefined
        
        const audienceString = audienceMap[audienceValue] || "All";
        
        console.log(`Announcement ${index}: audience DB value = ${a.audience}, mapped to = ${audienceString}`);
        
        return {
          ann_id: a.ann_id || `ann_${index}`,
          title: a.title || "",
          details: a.details || "",
          date: a.date || "",
          time: a.time || "",
          audience: audienceString as "All" | "Teachers" | "Parents",
          created_at: a.created_at || new Date().toISOString(),
          attachment: a.attachment || "",
          session_id: a.session_id || "",
          user_id: a.user_id || "",
          updated_at: a.updated_at || "",
        };
      });
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
    // Convert audience to number if it's a string
    const audienceValue = typeof announcement.audience === 'string' 
      ? audienceReverseMap[announcement.audience as keyof typeof audienceReverseMap] || 1
      : announcement.audience;
    
    const payload = {
      title: announcement.title,
      details: announcement.details,
      date: announcement.date,
      time: announcement.time,
      audience: audienceValue,
      user_id: announcement.user_id,
    };

    const response = await fetch(ANNOUNCEMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create announcement");
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
    const now = new Date();
    setIsModalOpen(true);
    setFormData({
      title: "",
      details: "",
      date: getLocalDateString(), // Use local date, not UTC
      time: now.toTimeString().slice(0, 5), // HH:MM format only
      audience: "All",
      user_id: user?.id ? String(user.id) : "",
      attachment: "",
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
      !formData.time ||
      !formData.user_id
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // Validate date is today only (use local date comparison)
    const todayLocalDate = getLocalDateString();
    
    if (formData.date !== todayLocalDate) {
      showToast("Can only create announcements for today", "error");
      return;
    }

    if (!user) {
      showToast("You must be logged in to create announcements", "error");
      return;
    }

    try {
      const createResult: ApiResponse<Announcement> | Announcement =
        await createAnnouncement({
          ...formData,
        });
      // Handle both wrapped response and direct data response
      const newData =
        (createResult as ApiResponse<Announcement>).data ||
        (createResult as Announcement);
      setAnnouncements([newData, ...announcements]);
      showToast("Announcement created successfully!", "success");
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          announcement.audience === 'All' || announcement.audience === 1 || String(announcement.audience) === '1'
                            ? 'bg-blue-100 text-blue-800' 
                            : announcement.audience === 'Teachers' || announcement.audience === 2 || String(announcement.audience) === '2'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          To: {typeof announcement.audience === 'number' 
                            ? audienceMap[announcement.audience] || 'All'
                            : announcement.audience}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Date: {formatDateForDisplay(announcement.date)}
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
                  New Announcement
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
                      type="text"
                      name="date"
                      value={new Date(formData.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-700"
                      title="Date is automatically set to today"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Automatically set to today
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
                    Create Announcement
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