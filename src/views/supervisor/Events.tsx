import { useState, useEffect, useCallback } from "react";
import { Calendar, Search, Plus, X, Edit } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

type Event = {
  event_id: number;
  user_id: number;
  image: string | null;
  date: string;
  time: string;
  description: string;
  topic: string;
  venue: string;
  created_time?: string;
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

const EVENTS_API_URL = `${API_BASE_URL}/events`;
const BASE_URL = API_BASE_URL.replace("/api", "");

const Events = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    image: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(EVENTS_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched events:", data);

      setEvents(data);
      setFilteredEvents(data);
      // Remove success toast on fetch to avoid too many notifications
    } catch (error) {
      console.error("Error fetching events:", error);
      showToast(
        "Failed to load events. Please check your connection.",
        "error"
      );
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Search events with debounce
  const searchEvents = useCallback(() => {
    if (!searchTerm && !searchDate) {
      setFilteredEvents(events);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      const filtered = events.filter((event) => {
        const termMatch = searchTerm
          ? event.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        const dateMatch = searchDate
          ? event.date.slice(0, 10) === searchDate
          : true;

        return termMatch && dateMatch;
      });

      setFilteredEvents(filtered);
      setIsSearching(false);

      if (filtered.length === 0) {
        showToast("No matching events found", "error");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDate, events]);

  // Effect to fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Effect to handle search when search term or date changes
  useEffect(() => {
    searchEvents();
  }, [searchTerm, searchDate, searchEvents]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      setFormData({
        ...formData,
        date: formattedDate,
      });
    }
  };

  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      topic: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].slice(0, 5),
      venue: "",
      image: null,
    });
  };

  const openEditModal = (event: Event) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentEvent(event);

    // Extract date string without timezone conversion
    let dateStr = "";
    if (event.date) {
      // If the date is already in YYYY-MM-DD format, use it directly
      if (
        typeof event.date === "string" &&
        event.date.match(/^\d{4}-\d{2}-\d{2}/)
      ) {
        dateStr = event.date.slice(0, 10);
      } else {
        // Otherwise, parse it carefully
        const dateObj = new Date(event.date);
        dateStr = dateObj.toISOString().split("T")[0];
      }
    }

    setFormData({
      topic: event.topic,
      description: event.description,

      date: dateStr,
      time: event.time ? event.time.slice(0, 5) : "",

      // date: event.date ? event.date.slice(0, 10) : "",
      // time: event.time ? event.time.slice(0, 5) : "",

      venue: event.venue,
      image: null,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentEvent(null);
    setFormData({
      topic: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      image: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.topic.trim() ||
      !formData.description.trim() ||
      !formData.date ||
      !formData.time ||
      !formData.venue.trim()
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Get the user ID from the logged-in user
      const userId = user?.id || user?.user_id;

      if (!userId && !isEditMode) {
        showToast("User not logged in. Please log in first.", "error");
        return;
      }

      // Prepare event payload with proper image handling
      const eventPayload = {
        topic: formData.topic.trim(),
        description: formData.description.trim(),
        venue: formData.venue.trim(),
        date: formData.date,
        time: formData.time,
        image: formData.image ? formData.image.name : null, // Send only the filename
        user_id: isEditMode ? undefined : userId, // Use actual logged-in user ID
      };

      let url = EVENTS_API_URL;
      let method = "POST";

      if (isEditMode && currentEvent) {
        url = `${EVENTS_API_URL}/${currentEvent.event_id}`;
        method = "PUT";
        console.log("Updating event:", currentEvent.event_id);
      } else {
        console.log("Creating new event");
      }

      console.log("Sending request to:", url);
      console.log("Method:", method);
      console.log("Payload:", eventPayload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to save event";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Operation result:", result);

      // Update local state
      if (isEditMode) {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.event_id === currentEvent?.event_id ? result : event
          )
        );
        showToast("Event updated successfully!", "success");
      } else {
        setEvents((prevEvents) => [result, ...prevEvents]);
        showToast("Event created successfully!", "success");
      }

      closeModal();

      // Refresh events from server to ensure consistency
      setTimeout(() => {
        fetchEvents();
      }, 500);
    } catch (error) {
      console.error("Error saving event:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save event. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async () => {
    if (!currentEvent) return;

    setIsLoading(true);

    try {
      console.log("Deleting event:", currentEvent.event_id);

      const response = await fetch(
        `${EVENTS_API_URL}/${currentEvent.event_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to delete event";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Update local state
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.event_id !== currentEvent.event_id)
      );

      showToast("Event deleted successfully!", "success");
      closeModal();

      // Refresh events from server to ensure consistency
      setTimeout(() => {
        fetchEvents();
      }, 500);
    } catch (error) {
      console.error("Error deleting event:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete event. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search filters
  const clearFilters = () => {
    setSearchTerm("");
    setSearchDate("");
  };

  if (isLoading && !isModalOpen && !isDeleteModalOpen) {
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
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Events
          </span>
        </h1>
      </div>

      {/* Search and Add Event */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by topic, description, or venue..."
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
              {/* Calendar icon for date search */}
              <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
              <input
                type="date"
                placeholder="Filter by event date..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </button>
          </div>

          {(searchTerm || searchDate) && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {filteredEvents.length} results
                {searchTerm && ` for "${searchTerm}"`}
                {searchDate &&
                  ` on ${(() => {
                    const [year, month, day] = searchDate
                      .split("-")
                      .map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    return dateObj.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                  })()}`}
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

      {/* Events Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-8xl mx-auto">
        {filteredEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const createdDateTime = event.created_time
                    ? formatDateTime(event.created_time)
                    : null;

                  return (
                    <tr key={event.event_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap w-1/5">
                        <div className="text-sm font-medium text-gray-900">
                          {event.topic}
                        </div>
                        {event.image && (
                          <img
                            src={`${BASE_URL}/uploads/${event.image}`}
                            alt={event.topic}
                            className="mt-2 w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 w-2/5">
                        <div className="text-sm text-gray-900 whitespace-pre-line break-words">
                          {event.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-1/5">
                        <div className="text-sm text-gray-900">
                          {(() => {
                            // Parse date string directly without timezone conversion
                            const [year, month, day] = event.date
                              .split("-")
                              .map(Number);
                            const dateObj = new Date(year, month - 1, day);
                            return dateObj.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            });
                          })()}{" "}
                          at {event.time}
                        </div>
                        {createdDateTime && (
                          <div className="mt-1 text-xs text-gray-500 flex items-center">
                            {/* <Clock className="w-3 h-3 mr-1" />
                            <span>Created: {createdDateTime.date}</span> */}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 w-1/5">
                        <div className="text-sm text-gray-900">
                          {event.venue}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 w-1/5">
                        <button
                          onClick={() => openEditModal(event)}
                          className={`text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 ${
                            event.date < new Date().toISOString().split("T")[0]
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={
                            event.date < new Date().toISOString().split("T")[0]
                              ? "Cannot edit past events"
                              : "Edit"
                          }
                          aria-label="Edit"
                          disabled={
                            event.date < new Date().toISOString().split("T")[0]
                          }

                          //         className={`text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 ${
                          //           new Date(event.date) <
                          //           new Date(new Date().toISOString().split("T")[0])
                          //             ? "opacity-50 cursor-not-allowed"
                          //             : ""
                          //         }`}
                          //         title={
                          //           new Date(event.date) <
                          //           new Date(new Date().toISOString().split("T")[0])
                          //             ? "Cannot edit past events"
                          //             : "Edit"
                          //         }
                          //         aria-label="Edit"
                          //         disabled={
                          //           new Date(event.date) <
                          //           new Date(new Date().toISOString().split("T")[0])
                          //         }
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* <button
                          onClick={() => openDeleteModal(event)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {isSearching
                ? "Searching..."
                : searchTerm || searchDate
                ? "No matching events found"
                : "No events found"}
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
                Add New Event
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? "Edit Event" : "Add Event"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-700 border-b border-indigo-100 pb-2">
                      Event Information
                    </h3>

                    <div>
                      <label
                        htmlFor="topic"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Topic *
                      </label>
                      <input
                        type="text"
                        id="topic"
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter event topic"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter event description"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="image"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Event Image
                      </label>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        accept="image/*"
                      />
                      {isEditMode && currentEvent?.image && !formData.image && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Current image:
                          </p>
                          <img
                            src={`${BASE_URL}/uploads/${currentEvent.image}`}
                            alt="Current event"
                            className="w-32 h-32 object-cover rounded mt-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-700 border-b border-indigo-100 pb-2">
                      Event Details
                    </h3>

                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date *
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={
                            formData.date ? new Date(formData.date) : null
                          }
                          onChange={handleDateChange}
                          minDate={new Date()}
                          maxDate={(() => {
                            const maxDate = new Date();
                            maxDate.setFullYear(maxDate.getFullYear() + 1);
                            return maxDate;
                          })()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                          required
                          dateFormat="yyyy-MM-dd"
                        />
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Select a date between today and one year from now
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="time"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Time *
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="venue"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Venue *
                      </label>
                      <input
                        type="text"
                        id="venue"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        placeholder="Enter event venue"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Processing..."
                      : isEditMode
                      ? "Update"
                      : "Create"}{" "}
                    Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Delete Event</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
                title="Close"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete the event{" "}
              <span className="font-semibold">{currentEvent?.topic}</span>? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={deleteEvent}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
