import { FileText, Download, Printer, X, FileBarChart2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import supervisorReportService, { type SupervisorReport } from '../../services/supervisorReportService';

const Reports = () => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SupervisorReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<SupervisorReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 means all months
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch all reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Fetch all supervisor reports
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await supervisorReportService.getAllReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  // Open report details modal
  const openDetails = (report: SupervisorReport) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  // Close report details modal
  const closeDetails = () => {
    setIsDetailOpen(false);
    setSelectedReport(null);
  };

  // Delete report
  const deleteReport = async (reportId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    const loadingToast = toast.loading('Deleting report...');
    
    try {
      await supervisorReportService.deleteReport(reportId);
      setReports(reports.filter(r => r.report_id !== reportId));
      toast.dismiss(loadingToast);
      toast.success('✅ Report deleted successfully!');
      closeDetails();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error deleting report:', error);
      toast.error('❌ Failed to delete report');
    }
  };

  // Filter reports based on search term, month, and year
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.report_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisorReportService.getMonthName(report.month).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = selectedMonth === 0 || report.month === selectedMonth;
    const matchesYear = report.year === selectedYear;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  // Get available years from reports
  const availableYears = Array.from(new Set(reports.map(r => r.year))).sort((a, b) => b - a);
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Monthly Reports
          </span>
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-1">
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-4 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              title="Filter by month"
              aria-label="Filter by month"
            >
              <option value={0}>All Months</option>
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              title="Filter by year"
              aria-label="Filter by year"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.report_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                            onClick={() => openDetails(report)}
                          >
                            {report.report_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {supervisorReportService.getMonthName(report.month)} {report.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supervisorReportService.formatDate(report.generated_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'completed' ? 'bg-green-100 text-green-800' :
                        report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          onClick={() => openDetails(report)}
                          title="View report details"
                        >
                          <FileBarChart2 className="w-4 h-4 mr-1" />
                          View
                        </button>
                        {/* {report.status === 'completed' && (
                          <button 
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No reports found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {isDetailOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FileText className="mr-2 text-indigo-600" size={20} />
                  {selectedReport.report_name}
                </h2>
                <button 
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Report Period</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {supervisorReportService.getMonthName(selectedReport.month)} {selectedReport.year}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Generated On</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {supervisorReportService.formatDate(selectedReport.generated_date)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Generated By</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.generated_by_name || 'System'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedReport.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedReport.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedReport.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Report Summary</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• New Admissions: <strong>{selectedReport.report_data.children.newAdmissions}</strong></p>
                    <p>• Total Enrolled: <strong>{selectedReport.report_data.children.totalEnrolled}</strong></p>
                    <p>• Total Complaints: <strong>{selectedReport.report_data.complaints.total}</strong></p>
                    <p>• Total Meetings: <strong>{selectedReport.report_data.meetings.total}</strong></p>
                    <p>• Avg. Attendance: <strong>{selectedReport.report_data.attendance.averageRate}%</strong></p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Detailed Metrics</h3>
                
                {/* Children Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">👶 Children & Admissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">New Admissions</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedReport.report_data.children.newAdmissions}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Total Enrolled</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedReport.report_data.children.totalEnrolled}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Avg. Attendance</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedReport.report_data.attendance.averageRate}%</p>
                    </div>
                  </div>
                </div>

                {/* Complaints Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Complaints</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-xl font-bold text-gray-700">{selectedReport.report_data.complaints.total}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Pending</p>
                      <p className="text-xl font-bold text-yellow-600">{selectedReport.report_data.complaints.pending}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">In Progress</p>
                      <p className="text-xl font-bold text-orange-600">{selectedReport.report_data.complaints.inProgress}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Solved</p>
                      <p className="text-xl font-bold text-green-600">{selectedReport.report_data.complaints.solved}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Closed</p>
                      <p className="text-xl font-bold text-gray-600">{selectedReport.report_data.complaints.closed}</p>
                    </div>
                  </div>
                </div>

                {/* Meetings Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📅 Meetings & Appointments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-xl font-bold text-gray-700">{selectedReport.report_data.meetings.total}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Pending</p>
                      <p className="text-xl font-bold text-yellow-600">{selectedReport.report_data.meetings.pending}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Confirmed</p>
                      <p className="text-xl font-bold text-green-600">{selectedReport.report_data.meetings.confirmed}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Cancelled</p>
                      <p className="text-xl font-bold text-red-600">{selectedReport.report_data.meetings.cancelled}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-4">
                <button 
                  onClick={() => deleteReport(selectedReport.report_id)}
                  className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete Report
                </button>
                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                  <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;