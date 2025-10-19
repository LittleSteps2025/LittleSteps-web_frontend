import { Download, FileText, BarChart2, Users, DollarSign, ClipboardList, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReportHistory {
  admin_report_id: string;
  name: string;
  type: string;
  format: string;
  size: string;
  created_at: string;
  download_url: string;
  generated_by?: string;
}

interface QuickStats {
  currentEnrollment: number;
  monthlyAttendanceAvg: number;
  revenueThisMonth: number;
  staffCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface GenerateReportParams {
  reportType: string;
  dateRange: {
    start: string;
    end: string;
  };
  format: string;
  groupBy?: string;
  detailLevel?: string;
}

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_ENDPOINTS = {
  GENERATE_REPORT: `${API_BASE_URL}/api/admin/reports/generate`,
  REPORT_HISTORY: `${API_BASE_URL}/api/admin/reports/history`,
  QUICK_STATS: `${API_BASE_URL}/api/admin/reports/quick-stats`,
  DOWNLOAD_REPORT: `${API_BASE_URL}/api/admin/reports/download`,
  EXPORT_ALL: `${API_BASE_URL}/api/admin/reports/export-all`,
} as const;

const ReportsPage = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<string | null>('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    currentEnrollment: 0,
    monthlyAttendanceAvg: 0,
    revenueThisMonth: 0,
    staffCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [groupBy, setGroupBy] = useState('daily');
  const [detailLevel, setDetailLevel] = useState('summary');

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch report history
  const fetchReportHistory = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.REPORT_HISTORY}?limit=10`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report history');
      }

      const data: ApiResponse<ReportHistory[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setReportHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching report history:', err);
      // Don't show error for history, just log it
    }
  };

  // Fetch quick stats
  const fetchQuickStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.QUICK_STATS, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quick stats');
      }

      const data: ApiResponse<QuickStats> = await response.json();
      
      if (data.success && data.data) {
        setQuickStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching quick stats:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchReportHistory(),
      fetchQuickStats()
    ]).finally(() => setLoading(false));
  }, []);

  // Generate report
  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    setError('');

    try {
      const params: GenerateReportParams = {
        reportType: selectedReport,
        dateRange,
        format: reportFormat
      };

      // Add optional parameters based on report type
      if (selectedReport === 'attendance') {
        params.groupBy = groupBy;
      }
      if (['payments', 'children', 'subscriptions', 'complaints', 'announcements', 'staff', 'parents'].includes(selectedReport)) {
        params.detailLevel = detailLevel;
      }

      const response = await fetch(API_ENDPOINTS.GENERATE_REPORT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to generate report');
      }

      const data = await response.json();

      if (data.success && data.data.download_url) {
        // Download the report
        window.open(data.data.download_url, '_blank');
        
        // Refresh report history
        await fetchReportHistory();
        
        // Show success message
        alert(`Report generated successfully! Download started.`);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download existing report
  const handleDownloadReport = async (adminReportId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.DOWNLOAD_REPORT}/${adminReportId}`);

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${adminReportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  // Export all data
  const handleExportAll = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.EXPORT_ALL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format: 'zip' })
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      
      if (data.success && data.data.download_url) {
        window.open(data.data.download_url, '_blank');
        alert('Export started! Download will begin shortly.');
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats
  const handleRefreshStats = async () => {
    setLoading(true);
    await fetchQuickStats();
    setLoading(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const reportTypes = [
    {
      id: 'children',
      name: 'Child Details Report',
      icon: <Users className="w-5 h-5" />,
      description: 'Complete list of children with enrollment details',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'attendance',
      name: 'Attendance Report',
      icon: <ClipboardList className="w-5 h-5" />,
      description: 'Daily check-ins/check-outs with time stamps',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions Report',
      icon: <FileText className="w-5 h-5" />,
      description: 'Active and expired subscription plans',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'payments',
      name: 'Payment Management Report',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Revenue, paid/unpaid payments, and balances',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'complaints',
      name: 'Complaints Report',
      icon: <AlertCircle className="w-5 h-5" />,
      description: 'Submitted complaints with status and resolution',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'announcements',
      name: 'Announcements Report',
      icon: <FileText className="w-5 h-5" />,
      description: 'Published announcements and events history',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'staff',
      name: 'Staff Report',
      icon: <Shield className="w-5 h-5" />,
      description: 'Teachers, supervisors, and admin activity',
      color: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'parents',
      name: 'Parents Report',
      icon: <Users className="w-5 h-5" />,
      description: 'Parent accounts and associated children',
      color: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 'mis',
      name: 'MIS Summary Report',
      icon: <BarChart2 className="w-5 h-5" />,
      description: 'Complete Management Information System overview',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Reports Center
          </span>
        </h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={handleExportAll}
            disabled={loading}
            className="btn-secondary flex items-center bg-white border border-gray-200 hover:border-purple-500 text-purple-700 hover:text-purple-800 hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Report Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-4 rounded-lg border transition-all flex items-start ${selectedReport === report.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'} hover:shadow-xs`}
                >
                  <div className={`p-2 rounded-full ${selectedReport === report.id ? 'bg-purple-100 text-purple-600' : report.color} mr-3 mt-0.5`}>
                    {report.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedReport && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {reportTypes.find(r => r.id === selectedReport)?.name} Configuration
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${reportTypes.find(r => r.id === selectedReport)?.color}`}>
                  {selectedReport.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      name="start"
                      value={dateRange.start}
                      onChange={handleDateChange}
                      className="input-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="date"
                      name="end"
                      value={dateRange.end}
                      onChange={handleDateChange}
                      className="input-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="csv">CSV Spreadsheet</option>
                    <option value="excel">Excel Workbook</option>
                  </select>
                </div>
              </div>

              {selectedReport === 'children' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Include</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                  >
                    <option value="all">All Children</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="withParents">With Parent Details</option>
                  </select>
                </div>
              )}

              {selectedReport === 'attendance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                  >
                    <option value="daily">Daily Summary</option>
                    <option value="child">By Child</option>
                    <option value="week">By Week</option>
                    <option value="month">By Month</option>
                  </select>
                </div>
              )}

              {selectedReport === 'subscriptions' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter By</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                  >
                    <option value="all">All Subscriptions</option>
                    <option value="active">Active Plans</option>
                    <option value="expired">Expired Plans</option>
                    <option value="expiring">Expiring Soon</option>
                  </select>
                </div>
              )}

              {selectedReport === 'payments' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Detail</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                  >
                    <option value="summary">Summary View</option>
                    <option value="detailed">Detailed Transactions</option>
                    <option value="unpaid">Unpaid Only</option>
                    <option value="methods">By Payment Method</option>
                  </select>
                </div>
              )}

              {selectedReport === 'complaints' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                  >
                    <option value="all">All Complaints</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="inProgress">In Progress</option>
                  </select>
                </div>
              )}

              {selectedReport === 'announcements' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Type</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                  >
                    <option value="all">All Announcements</option>
                    <option value="general">General</option>
                    <option value="event">Events</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              )}

              {selectedReport === 'staff' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                  >
                    <option value="all">All Staff</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="supervisors">Supervisors Only</option>
                    <option value="admin">Admin Only</option>
                  </select>
                </div>
              )}

              {selectedReport === 'parents' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Include</label>
                  <select 
                    className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                  >
                    <option value="all">All Parents</option>
                    <option value="withChildren">With Children Details</option>
                    <option value="withPayments">With Payment Status</option>
                    <option value="complete">Complete Profile</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="btn-primary bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Reports</h2>
              <button 
                onClick={() => navigate('/admin/reports/history')}
                className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {reportHistory.length > 0 ? (
                reportHistory.slice(0, 4).map((report) => (
                  <div key={report.admin_report_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {report.type === 'children' && <Users className="w-4 h-4 text-blue-600" />}
                        {report.type === 'attendance' && <ClipboardList className="w-4 h-4 text-purple-600" />}
                        {report.type === 'subscriptions' && <FileText className="w-4 h-4 text-indigo-600" />}
                        {report.type === 'payments' && <DollarSign className="w-4 h-4 text-green-600" />}
                        {report.type === 'complaints' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        {report.type === 'announcements' && <FileText className="w-4 h-4 text-yellow-600" />}
                        {report.type === 'staff' && <Shield className="w-4 h-4 text-amber-600" />}
                        {report.type === 'parents' && <Users className="w-4 h-4 text-cyan-600" />}
                        {report.type === 'mis' && <BarChart2 className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">{report.name}</h3>
                        <p className="text-xs text-gray-500">{formatDate(report.created_at)} • {report.size}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadReport(report.admin_report_id)}
                      className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded"
                      title="Download report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No recent reports available</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">MIS Quick Stats</h2>
              <button 
                onClick={handleRefreshStats}
                disabled={loading}
                className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-800">Current Enrollment</span>
                <span className="font-medium text-purple-900">{quickStats.currentEnrollment}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-800">Monthly Attendance Avg</span>
                <span className="font-medium text-blue-900">{quickStats.monthlyAttendanceAvg}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-800">Revenue This Month</span>
                <span className="font-medium text-green-900">
                  {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(quickStats.revenueThisMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm text-amber-800">Staff Count</span>
                <span className="font-medium text-amber-900">{quickStats.staffCount}</span>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => navigate('/admin/dashboard')}
                  className="w-full btn-secondary bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 flex items-center justify-center py-2 rounded-lg"
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  View Full Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;