import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertCircle, User, Filter, Eye, X, Edit } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import complaintService from "../../services/complaintService";
import type {
  Complaint,
  CreateComplaintData,
} from "../../services/complaintService";

const Complaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [recipientFilter, setRecipientFilter] = useState("All Recipients");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CreateComplaintData>({
    date: "",
    subject: "",
    recipient: "supervisor",
    description: "",
    status: "Pending",
    action: "",
    child_id: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Stats calculation based on status
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    solved: complaints.filter((c) => c.status === "Solved").length,
    closed: complaints.filter((c) => c.status === "Closed").length,
  };

  // Fetch complaints from database
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle URL parameter for auto-opening complaint detail
  useEffect(() => {
    const complaintId = searchParams.get("complaint_id");
    if (complaintId && complaints.length > 0) {
      const complaint = complaints.find(
        (c) => c.complaint_id === parseInt(complaintId)
      );
      if (complaint) {
        openViewModal(complaint);
        // Remove the parameter from URL after opening
        setSearchParams({});
      }
    }
  }, [searchParams, complaints, setSearchParams]);

  // Search complaints
  const handleSearch = useCallback(async () => {
    if (
      !searchTerm.trim() &&
      statusFilter === "All Status" &&
      recipientFilter === "All Recipients"
    ) {
      fetchComplaints();
      return;
    }
    setIsLoading(true);
    setIsSearching(true);
    try {
      const searchParams: {
        searchTerm?: string;
        status?: string;
        recipient?: string;
      } = {};
      if (searchTerm.trim()) searchParams.searchTerm = searchTerm;
      if (statusFilter !== "All Status") searchParams.status = statusFilter;
      if (recipientFilter !== "All Recipients")
        searchParams.recipient = recipientFilter;

      // Always filter for supervisor complaints
      searchParams.recipient = "supervisor";

      const data = await complaintService.searchComplaints(searchParams);
      setComplaints(data);
    } catch (error: unknown) {
      console.error("Error searching complaints:", error);
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, recipientFilter]);

  // Search effect with debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (
        searchTerm.trim() ||
        statusFilter !== "All Status" ||
        recipientFilter !== "All Recipients" ||
        isSearching
      ) {
        handleSearch();
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, statusFilter, recipientFilter, handleSearch, isSearching]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      // For supervisor, get complaints where recipient is 'supervisor'
      console.log("Fetching complaints for supervisor...");
      const data = await complaintService.getComplaintsByRecipient(
        "supervisor"
      );
      console.log("Fetched complaints:", data);
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }; // Handle input changes for form
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

  // Open modal for editing complaint
  const openEditModal = (complaint: Complaint) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentComplaint(complaint);
    setFormData({
      date: complaint.date,
      subject: complaint.subject,
      recipient: complaint.recipient,
      description: complaint.description,
      status: complaint.status,
      action: complaint.action || "",
      child_id: complaint.child_id,
    });
  };

  // Open view modal for complaint details
  const openViewModal = (complaint: Complaint) => {
    setIsViewModalOpen(true);
    setCurrentComplaint(complaint);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentComplaint(null);
  };

  // Handle form submission (for supervisor: only status and action updates)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode || !currentComplaint) return;

    const loadingToast = toast.loading("Updating complaint...");

    try {
      let statusUpdated = false;
      let actionUpdated = false;

      // Normalize values for comparison
      const currentAction = (currentComplaint.action || "").trim();
      const newAction = (formData.action || "").trim();
      const currentStatus = currentComplaint.status;
      const newStatus = formData.status;

      console.log("Current status:", currentStatus, "New status:", newStatus);
      console.log("Current action:", currentAction, "New action:", newAction);

      // Update status if changed
      if (newStatus && newStatus !== currentStatus) {
        console.log(
          `Updating status from "${currentStatus}" to "${newStatus}"`
        );
        const result = await complaintService.updateComplaintStatus(
          currentComplaint.complaint_id,
          newStatus
        );
        console.log("Status update result:", result);
        statusUpdated = true;
      }

      // Update action if different from current
      if (newAction !== currentAction) {
        console.log(
          `Updating action from "${currentAction}" to "${newAction}"`
        );
        const result = await complaintService.updateComplaintAction(
          currentComplaint.complaint_id,
          newAction
        );
        console.log("Action update result:", result);
        actionUpdated = true;
      }

      if (!statusUpdated && !actionUpdated) {
        toast.dismiss(loadingToast);
        toast.info("No changes to update");
        closeModal();
        return;
      }

      // Fetch updated complaint with full details
      console.log("Fetching updated complaint...");
      const updatedComplaint = await complaintService.getComplaintById(
        currentComplaint.complaint_id
      );
      console.log("Updated complaint fetched:", updatedComplaint);

      // Update the complaints list
      setComplaints(
        complaints.map((c) =>
          c.complaint_id === updatedComplaint.complaint_id
            ? updatedComplaint
            : c
        )
      );

      toast.dismiss(loadingToast);

      // Show specific success message
      if (statusUpdated && actionUpdated) {
        toast.success("✅ Complaint status and action updated successfully!");
      } else if (statusUpdated) {
        toast.success("✅ Complaint status updated successfully!");
      } else if (actionUpdated) {
        toast.success("✅ Complaint action updated successfully!");
      }

      closeModal();
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      console.error("Error updating complaint:", error);

      let errorMessage = "Failed to update complaint";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      toast.error(`❌ ${errorMessage}`);
    }
  };

  // Delete complaint
  const deleteComplaint = async () => {
    if (!currentComplaint) return;

    const loadingToast = toast.loading("Deleting complaint...");

    try {
      await complaintService.deleteComplaint(currentComplaint.complaint_id);

      // Remove from local state
      setComplaints(
        complaints.filter(
          (c) => c.complaint_id !== currentComplaint.complaint_id
        )
      );

      toast.dismiss(loadingToast);
      toast.success("✅ Complaint deleted successfully!");
      closeModal();
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      console.error("Error deleting complaint:", error);

      let errorMessage = "Failed to delete complaint";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      toast.error(`❌ ${errorMessage}`);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setRecipientFilter("All Recipients");
    fetchComplaints();
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
            Complaints Management
          </span>
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints by subject, description, child name, or parent name..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                title="Filter by status"
                aria-label="Filter complaints by status"
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Solved">Solved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Total Complaints</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Solved</h3>
          <p className="text-2xl font-bold text-green-600">{stats.solved}</p>
        </div>
        <div className="border p-4 rounded-lg bg-white">
          <h3 className="text-sm text-gray-500">Closed</h3>
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                    Complaint Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Child & Parent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.complaint_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start">
                        <AlertCircle className="flex-shrink-0 h-8 w-8 text-red-600 mt-1" />
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 break-words mb-1">
                            {complaint.subject}
                          </div>
                          <div className="text-sm text-gray-500 break-words mb-2">
                            {complaint.description}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(complaint.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start">
                        <User className="flex-shrink-0 h-8 w-8 text-indigo-600 mt-1" />
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 break-words mb-1">
                            Parent: {complaint.parent_name}
                          </div>
                          <div className="text-sm text-gray-500 break-words">
                            Child: {complaint.child_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          complaint.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : complaint.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : complaint.status === "Solved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => openViewModal(complaint)}
                          className="text-blue-600 hover:text-blue-900 flex items-center text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(complaint)}
                          className="text-green-600 hover:text-green-900 flex items-center text-sm"
                          title="Update Status & Action"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Action
                        </button>
                        {/* <button
                          onClick={() => openDeleteModal(complaint)}
                          className="text-red-600 hover:text-red-900 flex items-center text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {isSearching
                ? "No matching complaints found"
                : "No complaints found"}
            </p>
          </div>
        )}
      </div>

      {/* Edit Complaint Status and Action Modal */}
      {isModalOpen && isEditMode && currentComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Update Complaint Status & Action
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
                {/* Complaint Details (Read-only) */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Complaint Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(currentComplaint.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Recipient
                      </label>
                      <p className="text-sm text-gray-900">
                        {currentComplaint.recipient.charAt(0).toUpperCase() +
                          currentComplaint.recipient.slice(1)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Subject
                    </label>
                    <p className="text-sm text-gray-900">
                      {currentComplaint.subject}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="text-sm text-gray-900">
                      {currentComplaint.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Child
                      </label>
                      <p className="text-sm text-gray-900">
                        {currentComplaint.child_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Parent
                      </label>
                      <p className="text-sm text-gray-900">
                        {currentComplaint.parent_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-semibold text-gray-700">
                    Update Response
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      title="Select complaint status"
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Solved">Solved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Taken
                    </label>
                    <textarea
                      name="action"
                      value={formData.action}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter action taken or response to the complaint..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe what actions were taken to resolve this complaint
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
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
                    Update Status & Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Complaint Details Modal */}
      {isViewModalOpen && currentComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Complaint Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Basic Information
                    </h3>
                    <p>
                      <strong>Subject:</strong> {currentComplaint.subject}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(currentComplaint.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Recipient:</strong>{" "}
                      {currentComplaint.recipient.charAt(0).toUpperCase() +
                        currentComplaint.recipient.slice(1)}
                    </p>
                    <p>
                      <strong>Status:</strong> {currentComplaint.status}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Child & Parent
                    </h3>
                    <p>
                      <strong>Child:</strong> {currentComplaint.child_name} (
                      {currentComplaint.child_age} years)
                    </p>
                    <p>
                      <strong>Parent:</strong> {currentComplaint.parent_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {currentComplaint.parent_email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {currentComplaint.parent_phone}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">
                    {currentComplaint.description}
                  </p>
                </div>

                {currentComplaint.action && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Action Taken
                    </h3>
                    <p className="text-gray-700">{currentComplaint.action}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
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
                Are you sure you want to delete the complaint "
                {currentComplaint?.subject}"? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteComplaint}
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

export default Complaints;
