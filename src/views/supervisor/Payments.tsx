import { useState, useEffect, useCallback } from "react";

import {
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Filter,
  Download,
  FileText,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Payment {
  payment_id: number;
  amount: string;
  created_at: string;
  parent_id: string;
  child_id: number;
  status: "pending" | "paid";
  order_id: string;
  currency: string;
  parent_name: string;
  child_name: string;
  package_name?: string;
  method?: string;
  transaction_ref?: string;
  notes?: string;
}

interface PaymentStats {
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
}

interface PaymentStatsData {
  status: string;
  count: string;
  total_amount: string;
}

interface ProcessPaymentData {
  method: "Cash" | "Card" | "Online";
  transaction_ref?: string;
  notes?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 10;

const Payments = () => {
  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">(
    "all"
  );
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });
  const [processPaymentData, setProcessPaymentData] =
    useState<ProcessPaymentData>({
      method: "Cash",
      transaction_ref: "",
      notes: "",
    });

  // Fetch payments data
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/supervisor/payments`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch payments: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setPayments(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch payments");
      }
    } catch (err) {
      console.error("Error in fetchPayments:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payment statistics
  const fetchPaymentStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/supervisor/payments/stats`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment statistics");
      }

      const data = await response.json();
      if (data.success) {
        // Process stats: data.data is an array of {status, count, total_amount}
        const stats = data.data.reduce(
          (acc: PaymentStats, curr: PaymentStatsData) => {
            const amount = parseFloat(curr.total_amount) || 0;
            if (curr.status.toLowerCase() === "paid") {
              acc.paidAmount = amount;
            } else if (curr.status.toLowerCase() === "pending") {
              acc.pendingAmount = amount;
            }
            acc.totalRevenue = acc.paidAmount + acc.pendingAmount;
            return acc;
          },
          { totalRevenue: 0, paidAmount: 0, pendingAmount: 0 }
        );
        setStats(stats);
      }
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    }
  }, []);

  // Process payment
  const handleProcessPayment = async () => {
    if (!selectedPayment) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/supervisor/payments/${selectedPayment.payment_id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Paid",
            ...processPaymentData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process payment");
      }

      const data = await response.json();
      if (data.success) {
        setShowProcessModal(false);
        setSelectedPayment(null);
        setProcessPaymentData({
          method: "Cash",
          transaction_ref: "",
          notes: "",
        });
        fetchPayments();
        fetchPaymentStats();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process payment"
      );
    }
  };

  // Export payments
  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const response = await fetch(`${API_BASE_URL}/supervisor/payments`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export payments as ${format}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to export payments as ${format}`
      );
    }
    setShowExportModal(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, [fetchPayments, fetchPaymentStats]);

  // Filter and sort payments
  const filteredAndSortedPayments = payments
    .filter((payment) => {
      const matchesSearch =
        searchTerm === "" ||
        payment.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_id.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedPayments.length / ITEMS_PER_PAGE
  );
  const paginatedPayments = filteredAndSortedPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  // Sort handler
  const handleSort = (key: keyof Payment) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
              Payments
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${payments.length} total payments`}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              fetchPayments();
              fetchPaymentStats();
            }}
            className="btn-primary"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="text-indigo-600 mr-2" />
              <h3 className="font-medium">Total Revenue</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              <h3 className="font-medium">Paid</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(stats.paidAmount)}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="text-yellow-600 mr-2" />
              <h3 className="font-medium">Pending</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(stats.pendingAmount)}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="btn-outline flex items-center"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {statusFilter === "all"
                  ? "All Status"
                  : statusFilter === "paid"
                  ? "Paid"
                  : "Pending"}
                {showFilterDropdown ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 ${
                        statusFilter === "all"
                          ? "bg-indigo-50 text-indigo-600"
                          : ""
                      }`}
                      onClick={() => {
                        setStatusFilter("all");
                        setShowFilterDropdown(false);
                      }}
                    >
                      All Payments
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 ${
                        statusFilter === "paid"
                          ? "bg-indigo-50 text-indigo-600"
                          : ""
                      }`}
                      onClick={() => {
                        setStatusFilter("paid");
                        setShowFilterDropdown(false);
                      }}
                    >
                      Paid
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 ${
                        statusFilter === "pending"
                          ? "bg-indigo-50 text-indigo-600"
                          : ""
                      }`}
                      onClick={() => {
                        setStatusFilter("pending");
                        setShowFilterDropdown(false);
                      }}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("payment_id")}
                >
                  <div className="flex items-center">
                    Payment ID
                    {sortConfig.key === "payment_id" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-1 w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === "amount" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-1 w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === "created_at" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-1 w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === "status" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-1 w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.payment_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.parent_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.child_name || `Child ${payment.child_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(parseFloat(payment.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === "pending" && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowProcessModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Process Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredAndSortedPayments.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredAndSortedPayments.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronUp className="h-5 w-5 rotate-[-90deg]" />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === idx + 1
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 rotate-[-90deg]" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Process Payment Modal */}
      {showProcessModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Process Payment
              </h2>
              <button onClick={() => setShowProcessModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedPayment.parent_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(parseFloat(selectedPayment.amount))}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={processPaymentData.method}
                  onChange={(e) =>
                    setProcessPaymentData((prev) => ({
                      ...prev,
                      method: e.target.value as ProcessPaymentData["method"],
                    }))
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={processPaymentData.transaction_ref}
                  onChange={(e) =>
                    setProcessPaymentData((prev) => ({
                      ...prev,
                      transaction_ref: e.target.value,
                    }))
                  }
                  placeholder="Enter transaction reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={processPaymentData.notes}
                  onChange={(e) =>
                    setProcessPaymentData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Add any additional notes"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowProcessModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Processing..." : "Process Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Export Payments
              </h2>
              <button onClick={() => setShowExportModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Choose a format to export the payments data:
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    CSV Format
                  </span>
                  <span className="text-xs text-gray-500">Spreadsheet</span>
                </button>

                <button
                  onClick={() => handleExport("pdf")}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    PDF Format
                  </span>
                  <span className="text-xs text-gray-500">Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
