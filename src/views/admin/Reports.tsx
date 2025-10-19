import {
  Download,
  FileText,
  Users,
  DollarSign,
  ClipboardList,
  AlertCircle,

} from "lucide-react";
import { useState } from "react";
import { API_BASE_URL } from "../../config/api";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (reportId: string, reportName: string) => {
    setDownloading(reportId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/reports/${reportId}/download`
      );
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportId}-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert(`Failed to download ${reportName}`);
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: "children",
      name: "Child Details",
      icon: Users,
      desc: "All children with enrollment details",
      color: "blue",
    },
    {
      id: "attendance",
      name: "Attendance Records",
      icon: ClipboardList,
      desc: "Check-in/out history",
      color: "purple",
    },
    {
      id: "subscriptions",
      name: "Subscription Plans",
      icon: FileText,
      desc: "Active and expired plans",
      color: "indigo",
    },
    {
      id: "payments",
      name: "Payment Records",
      icon: DollarSign,
      desc: "Revenue and payment status",
      color: "green",
    },
    {
      id: "complaints",
      name: "Complaints Log",
      icon: AlertCircle,
      desc: "Submitted complaints",
      color: "red",
    },
    // {
    //   id: "announcements",
    //   name: "Announcements",
    //   icon: Megaphone,
    //   desc: "Published announcements",
    //   color: "yellow",
    // },
    // {
    //   id: "staff",
    //   name: "Staff Details",
    //   icon: Shield,
    //   desc: "Supervisors and teachers",
    //   color: "amber",
    // },
    // {
    //   id: "parents",
    //   name: "Parent Details",
    //   icon: UserCircle,
    //   desc: "Parent contact information",
    //   color: "cyan",
    // },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Reports & Records
          </span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Download complete data records for all categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-${report.color}-100 p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {report.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{report.desc}</p>

              <button
                onClick={() => handleDownload(report.id, report.name)}
                disabled={downloading === report.id}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                  downloading === report.id
                    ? "bg-gray-400"
                    : `bg-${report.color}-600 hover:bg-${report.color}-700`
                }`}
              >
                {downloading === report.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Report
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              About Downloaded Reports
            </h4>
            <p className="text-sm text-blue-800">
              Reports are downloaded as Excel files (.xlsx) with complete data
              and timestamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
