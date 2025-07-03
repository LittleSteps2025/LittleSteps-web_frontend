import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';

const Reports = () => {
  const reports = [
    { 
      id: 1,
      name: 'Monthly Attendance Summary',
      type: 'Attendance',
      date: '2023-05-01',
      size: '2.4 MB'
    },
    { 
      id: 2,
      name: 'Health Checkups Report',
      type: 'Health',
      date: '2023-04-28',
      size: '1.8 MB'
    },
    { 
      id: 3,
      name: 'Activities Participation',
      type: 'Activities',
      date: '2023-05-10',
      size: '3.2 MB'
    },
    { 
      id: 4,
      name: 'Yearly Performance Review',
      type: 'Performance',
      date: '2023-01-15',
      size: '5.1 MB'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Reports
          </span>
        </h1>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            Generate Report
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-4 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-4 flex items-center">
            <Calendar className="mr-2 text-gray-400" />
            <label htmlFor="report-date-filter" className="sr-only">
              Filter reports by date
            </label>
            <select
              id="report-date-filter"
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter reports by date"
            >
              <option>All Dates</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>

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
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="flex-shrink-0 h-8 w-8 text-indigo-600" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
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
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 flex items-center">
                      <Printer className="w-4 h-4 mr-1" />
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;