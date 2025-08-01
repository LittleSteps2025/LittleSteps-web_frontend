import { Download, FileText, BarChart2, Users, DollarSign, ClipboardList, Shield } from 'lucide-react';
import { useState } from 'react';

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'attendance',
      name: 'Attendance Report',
      icon: <ClipboardList className="w-5 h-5" />,
      description: 'Daily check-ins/check-outs with time stamps',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'financial',
      name: 'Financial Report',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Revenue, payments, and outstanding balances',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'enrollment',
      name: 'Enrollment Report',
      icon: <Users className="w-5 h-5" />,
      description: 'Current and historical enrollment statistics',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'staff',
      name: 'Staff Activity Report',
      icon: <Shield className="w-5 h-5" />,
      description: 'Teacher and supervisor activities',
      color: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'incidents',
      name: 'Incident Reports',
      icon: <FileText className="w-5 h-5" />,
      description: 'Recorded incidents and complaints',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'mis',
      name: 'MIS Summary',
      icon: <BarChart2 className="w-5 h-5" />,
      description: 'Management Information System dashboard',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would trigger a download
      alert(`Report generated successfully! (${selectedReport}.${reportFormat})`);
    }, 1500);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Reports Center</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button className="btn-secondary flex items-center bg-white border border-gray-200 hover:border-purple-500 text-purple-700 hover:text-purple-800 hover:bg-purple-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </button>
        </div>
      </div>

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

              {selectedReport === 'financial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Detail</label>
                  <select className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <option>Summary View</option>
                    <option>Detailed Transactions</option>
                    <option>Outstanding Balances</option>
                    <option>Payment Methods</option>
                  </select>
                </div>
              )}

              {selectedReport === 'attendance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                  <select className="select-small border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <option>Daily Summary</option>
                    <option>By Child</option>
                    <option>By Classroom</option>
                    <option>By Time Period</option>
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
              <button className="text-sm text-purple-600 hover:text-purple-800 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Monthly Attendance', date: '2023-11-01', type: 'pdf', size: '2.4 MB', icon: <ClipboardList className="w-4 h-4 text-purple-600" /> },
                { name: 'Financial Q3', date: '2023-10-15', type: 'excel', size: '1.8 MB', icon: <DollarSign className="w-4 h-4 text-green-600" /> },
                { name: 'Enrollment Stats', date: '2023-10-01', type: 'pdf', size: '3.1 MB', icon: <Users className="w-4 h-4 text-blue-600" /> },
                { name: 'Staff Performance', date: '2023-09-28', type: 'pdf', size: '1.5 MB', icon: <Shield className="w-4 h-4 text-amber-600" /> }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{report.name}</h3>
                      <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">MIS Quick Stats</h2>
              <button className="text-sm text-purple-600 hover:text-purple-800 hover:underline">Refresh</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-800">Current Enrollment</span>
                <span className="font-medium text-purple-900">245</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-800">Monthly Attendance Avg</span>
                <span className="font-medium text-blue-900">89%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-800">Revenue This Month</span>
                <span className="font-medium text-green-900">$12,540</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm text-amber-800">Staff Count</span>
                <span className="font-medium text-amber-900">33</span>
              </div>
              <div className="pt-2">
                <button className="w-full btn-secondary bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 flex items-center justify-center py-2 rounded-lg">
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