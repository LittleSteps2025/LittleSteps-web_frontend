import { FileText, Download, Printer, Calendar, X, FileBarChart2, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Define report content types
interface AttendanceReportContent {
  totalStudents: number;
  averageAttendance: string;
  mostAbsentStudent: string;
  bestAttender: string;
}

interface HealthReportContent {
  studentsScreened: number;
  followUpsRequired: number;
  commonIssues: string;
  nextCheckup: string;
}

interface ActivitiesReportContent {
  totalActivities: number;
  mostPopular: string;
  leastPopular: string;
  participationRate: string;
}

interface GeneratedReportContent {
  format: string;
  detailLevel: string;
  includesCharts: boolean;
}

type ReportType =
  | { id: number; name: string; type: 'Attendance'; date: string; size: string; description: string; generatedBy: string; content: AttendanceReportContent }
  | { id: number; name: string; type: 'Health'; date: string; size: string; description: string; generatedBy: string; content: HealthReportContent }
  | { id: number; name: string; type: 'Activities'; date: string; size: string; description: string; generatedBy: string; content: ActivitiesReportContent }
  | { id: number; name: string; type: string; date: string; size: string; description: string; generatedBy: string; content: GeneratedReportContent };

const Reports = () => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'Attendance',
    startDate: '',
    endDate: '',
    format: 'PDF',
    includeCharts: true,
    detailLevel: 'Summary'
  });

  // Sample report data
  const [reports, setReports] = useState<ReportType[]>([
    {
      id: 1,
      name: 'Monthly Attendance Summary',
      type: 'Attendance',
      date: '2023-05-01',
      size: '2.4 MB',
      description: 'Comprehensive report showing daily attendance patterns, trends, and comparisons with previous months.',
      generatedBy: 'System Auto-Generated',
      content: {
        totalStudents: 24,
        averageAttendance: '92%',
        mostAbsentStudent: 'Liam Chen (3 days)',
        bestAttender: 'Olivia Smith (100%)'
      }
    },
    {
      id: 2,
      name: 'Health Checkups Report',
      type: 'Health',
      date: '2023-04-28',
      size: '1.8 MB',
      description: 'Results from the quarterly health screenings including height, weight, vision, and hearing tests.',
      generatedBy: 'Nurse Sarah Johnson',
      content: {
        studentsScreened: 24,
        followUpsRequired: 3,
        commonIssues: '2 vision concerns, 1 hearing concern',
        nextCheckup: '2023-07-28'
      }
    },
    {
      id: 3,
      name: 'Activities Participation',
      type: 'Activities',
      date: '2023-05-10',
      size: '3.2 MB',
      description: 'Participation metrics for all extracurricular activities offered this semester.',
      generatedBy: 'Activity Coordinator',
      content: {
        totalActivities: 8,
        mostPopular: 'Arts & Crafts (18 participants)',
        leastPopular: 'Gardening (6 participants)',
        participationRate: '83%'
      }
    }
  ]);

  const reportTypes = ['Attendance', 'Health', 'Activities', 'Performance', 'Financial'];
  const reportFormats = ['PDF', 'Excel', 'CSV', 'HTML'];
  const detailLevels = ['Summary', 'Detailed', 'Comprehensive'];

  // Open report details modal
  const openDetails = (report: ReportType) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  // Close report details modal
  const closeDetails = () => {
    setIsDetailOpen(false);
    setSelectedReport(null);
  };

  // Close generate report modal
  const closeGenerate = () => {
    setIsGenerateOpen(false);
    setNewReport({
      name: '',
      type: 'Attendance',
      startDate: '',
      endDate: '',
      format: 'PDF',
      includeCharts: true,
      detailLevel: 'Summary'
    });
  };

  // Handle form input changes
  const handleGenerateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    if (type === 'checkbox') {
      const inputElement = e.target as HTMLInputElement;
      setNewReport(prev => ({
        ...prev,
        [name]: inputElement.checked
      }));
    } else {
      setNewReport(prev => ({
        ...prev,
        [name]: e.target.value
      }));
    }
  };

  // Generate new report
  const generateReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // If the type is not one of the hardcoded types, treat as generated
    const generatedType: string = newReport.type;
    let content: AttendanceReportContent | HealthReportContent | ActivitiesReportContent | GeneratedReportContent;
    if (generatedType === 'Attendance') {
      content = {
        totalStudents: 0,
        averageAttendance: '',
        mostAbsentStudent: '',
        bestAttender: ''
      };
    } else if (generatedType === 'Health') {
      content = {
        studentsScreened: 0,
        followUpsRequired: 0,
        commonIssues: '',
        nextCheckup: ''
      };
    } else if (generatedType === 'Activities') {
      content = {
        totalActivities: 0,
        mostPopular: '',
        leastPopular: '',
        participationRate: ''
      };
    } else {
      // For custom types, use GeneratedReportContent
      content = {
        format: newReport.format,
        detailLevel: newReport.detailLevel,
        includesCharts: newReport.includeCharts
      };
    }
    const generatedReport: ReportType = {
      id: reports.length + 1,
      name: newReport.name || `${newReport.type} Report - ${new Date().toLocaleDateString()}`,
      type: newReport.type,
      date: new Date().toISOString().split('T')[0],
      size: '1.2 MB',
      description: `Generated ${newReport.type} report for period ${newReport.startDate || 'N/A'} to ${newReport.endDate || 'N/A'}`,
      generatedBy: 'Admin User',
      content
    } as ReportType;
    setReports([generatedReport, ...reports]);
    closeGenerate();
  };

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Reports
          </span>
        </h1>
        {/* <button 
          onClick={openGenerate}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </button> */}
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="Search reports by name, type or description..."
            className="pl-4 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                            onClick={() => openDetails(report)}
                          >
                            {report.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.type === 'Attendance' ? 'bg-blue-100 text-blue-800' :
                        report.type === 'Health' ? 'bg-green-100 text-green-800' :
                        report.type === 'Activities' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                        onClick={() => openDetails(report)}
                        title="View report details"
                      >
                        <FileBarChart2 className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                        title="Download report"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
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
      {isDetailOpen && selectedReport && typeof selectedReport === 'object' && 'name' in selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FileText className="mr-2 text-indigo-600" size={20} />
                  {selectedReport.name}
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
                    <h3 className="text-sm font-medium text-gray-500">Report Type</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full ${
                        selectedReport.type === 'Attendance' ? 'bg-blue-100 text-blue-800' :
                        selectedReport.type === 'Health' ? 'bg-green-100 text-green-800' :
                        selectedReport.type === 'Activities' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedReport.type}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Generated On</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.date}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Generated By</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.generatedBy}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.description}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedReport.content).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <p className="mt-1 text-lg font-medium text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
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
      )}

      {/* Generate Report Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Plus className="mr-2 text-indigo-600" size={20} />
                  Generate New Report
                </h2>
                <button 
                  onClick={closeGenerate}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={generateReport}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newReport.name}
                      onChange={handleGenerateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Custom report name (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <div className="relative">
                      <select
                        name="type"
                        value={newReport.type}
                        onChange={handleGenerateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        title="Select the type of report to generate"
                        aria-label="Report Type"
                      >
                        {reportTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={newReport.startDate}
                        onChange={handleGenerateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                        title="Select the start date for the report"
                        aria-label="Start Date"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={newReport.endDate}
                        onChange={handleGenerateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                        title="Select the end date for the report"
                        aria-label="End Date"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                    <div className="relative">
                      <select
                        name="format"
                        value={newReport.format}
                        onChange={handleGenerateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        title="Select the output format for the report"
                        aria-label="Output Format"
                      >
                        {reportFormats.map(format => (
                          <option key={format} value={format}>{format}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detail Level</label>
                    <div className="relative">
                      <select
                        name="detailLevel"
                        value={newReport.detailLevel}
                        onChange={handleGenerateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        title="Select the detail level for the report"
                        aria-label="Detail Level"
                      >
                        {detailLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="includeCharts"
                        checked={newReport.includeCharts}
                        onChange={handleGenerateChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        title="Include charts and visualizations in the report"
                        aria-label="Include charts and visualizations"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Include charts and visualizations
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeGenerate}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Generate Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;