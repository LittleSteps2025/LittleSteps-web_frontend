import { useState, useEffect } from 'react';
import { 
  Search, CreditCard, Download, Filter, ChevronUp, ChevronDown, Eye, Calendar, DollarSign, User, Package
} from 'lucide-react';

interface Payment {
  payment_id: string;
  amount: number;
  created_at: string;
  parent_id: string;
  child_id: string;
  package_id: string;
  month: string;
  method: string;
  transaction_ref: string;
  notes: string | null;
  order_id: string;
  status: 'paid' | 'unpaid';
  parent_name?: string;
  child_name?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_ENDPOINTS = {
  PAYMENTS: `${API_BASE_URL}/api/admin/payments`,  // Changed from /api/payment
} as const;

const PaymentManagement = () => {
  // State for payments data and loading
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Helper: read stored token from localStorage
  const getStoredToken = (): string | null => {
    return localStorage.getItem('token');
  };

  // Fetch payments from API
  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching payments from:', API_ENDPOINTS.PAYMENTS);
      const response = await fetch(API_ENDPOINTS.PAYMENTS, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check the server configuration.');
        } else {
          throw new Error(errorData?.message || 'Failed to fetch payments');
        }
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && Array.isArray(data.data)) {
        setPayments(data.data);
      } else {
        throw new Error(data.message || 'Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Sort keys based on the Payment interface
  const sortKeys = ['created_at', 'amount', 'method', 'parent_id', 'child_id'] as const;
  type SortKey = typeof sortKeys[number];

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ 
    key: 'created_at', 
    direction: 'desc' 
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter and sort payments
  const filteredPayments = payments
    .filter(payment => 
      (payment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payment.transaction_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payment.parent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payment.child_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (payment.parent_name && payment.parent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (payment.child_name && payment.child_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
       payment.method.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeFilter === 'all' || payment.method === activeFilter) &&
      (paymentStatusFilter === 'all' || payment.status === paymentStatusFilter)
    )
    .sort((a, b) => {
      const key = sortConfig.key;
      const aValue = a[key];
      const bValue = b[key];

      if (String(aValue) < String(bValue)) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (String(aValue) > String(bValue)) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const indexOfLastPayment = currentPage * itemsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const openDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting payments as ${format}`);
    setShowExportModal(false);
  };

  // Get unique payment methods for filter
  const paymentMethods = Array.from(new Set(payments.map(p => p.method)));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
              Payment Management
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {filteredPayments.length} | 
            Paid: {filteredPayments.filter(p => p.status === 'paid').length} | 
            Unpaid: {filteredPayments.filter(p => p.status === 'unpaid').length} | 
            Amount: {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowExportModal(true)} 
            className="bg-[#6339C0] text-white py-2 px-4 rounded-lg hover:bg-[#5227a3] transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              id="search-payments"
              name="search-payments"
              placeholder="Search by order ID, transaction ref, parent, child, or method..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            {/* Payment Status Filter */}
            <div className="dropdown relative">
              <button
                className="btn-outline flex items-center"
                onClick={() => setShowStatusFilterDropdown((prev) => !prev)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Status: {paymentStatusFilter === 'all' ? 'All' : paymentStatusFilter === 'paid' ? 'Paid' : 'Unpaid'}
                {showStatusFilterDropdown ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
              {showStatusFilterDropdown && (
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${paymentStatusFilter === 'all' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setPaymentStatusFilter('all'); setShowStatusFilterDropdown(false); }}
                    >
                      All Status
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${paymentStatusFilter === 'paid' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setPaymentStatusFilter('paid'); setShowStatusFilterDropdown(false); }}
                    >
                      ✓ Paid
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${paymentStatusFilter === 'unpaid' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setPaymentStatusFilter('unpaid'); setShowStatusFilterDropdown(false); }}
                    >
                      ✗ Unpaid
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Method Filter */}
            <div className="dropdown relative">
              <button
                className="btn-outline flex items-center"
                onClick={() => setShowFilterDropdown((prev) => !prev)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Method: {activeFilter === 'all' ? 'All' : activeFilter}
                {showFilterDropdown ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'all' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('all'); setShowFilterDropdown(false); }}
                    >
                      All Methods
                    </button>
                    {paymentMethods.map((method) => (
                      <button 
                        key={method}
                        className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === method ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                        onClick={() => { setActiveFilter(method); setShowFilterDropdown(false); }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('created_at')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'created_at' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('method')}
                >
                  <div className="flex items-center">
                    Method
                    {sortConfig.key === 'method' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading payments...
                  </td>
                </tr>
              ) : currentPayments.length > 0 ? (
                currentPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{payment.parent_name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">ID: {payment.parent_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{payment.child_name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">ID: {payment.child_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailsModal(payment)}
                        className="text-[#6339C0] hover:text-[#7e57ff]"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No payments found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstPayment + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastPayment, filteredPayments.length)}</span> of{' '}
                  <span className="font-medium">{filteredPayments.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronUp className="h-5 w-5 rotate-[-90deg]" />
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-[#6339C0] border-[#6339C0] text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronDown className="h-5 w-5 rotate-[-90deg]" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Order ID</h4>
                    </div>
                    <p className="text-sm text-gray-900 font-mono">{selectedPayment.order_id}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="w-5 h-5 text-gray-500 mr-2">●</span>
                      <h4 className="text-sm font-medium text-gray-700">Payment Status</h4>
                    </div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedPayment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPayment.status === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Amount</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Date</h4>
                    </div>
                    <p className="text-sm text-gray-900">{formatDate(selectedPayment.created_at)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Payment Method</h4>
                    </div>
                    <p className="text-sm text-gray-900">{selectedPayment.method}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Transaction Reference</h4>
                    </div>
                    <p className="text-sm text-gray-900 font-mono">{selectedPayment.transaction_ref}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Parent</h4>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{selectedPayment.parent_name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {selectedPayment.parent_id}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Child</h4>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{selectedPayment.child_name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {selectedPayment.child_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Package className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Package ID</h4>
                    </div>
                    <p className="text-sm text-gray-900">{selectedPayment.package_id}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Month</h4>
                    </div>
                    <p className="text-sm text-gray-900">{selectedPayment.month}</p>
                  </div>
                </div>
                
                {selectedPayment.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-900 whitespace-pre-line">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Export Payments</h2>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-500">
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Select the format you want to export the payment data in:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#6339C0] hover:bg-[#f3eeff] transition-colors"
                  >
                    <Download className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="font-medium">CSV Format</span>
                    <span className="text-xs text-gray-500 mt-1">Excel, Numbers, etc.</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#6339C0] hover:bg-[#f3eeff] transition-colors"
                  >
                    <Download className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="font-medium">PDF Format</span>
                    <span className="text-xs text-gray-500 mt-1">Adobe Reader, etc.</span>
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
