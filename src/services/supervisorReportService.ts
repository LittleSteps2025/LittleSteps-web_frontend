import axios from "axios";
import { API_BASE_URL } from "../config/api";

const SUPERVISOR_REPORTS_URL = `${API_BASE_URL}/supervisor-reports`;

export interface SupervisorReport {
  report_id: number | string;
  report_name: string;
  report_type: "monthly_summary" | "custom";
  month: number;
  year: number;
  generated_by: number | null;
  generated_date: string;
  report_data: MonthlyReportData;
  pdf_path?: string | null;
  status: "generating" | "completed" | "failed";
  generated_by_name?: string;
  generated_by_email?: string;
}

export interface MonthlyReportData {
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  children: {
    newAdmissions: number;
    totalEnrolled: number;
    admissionsList: Array<{
      child_id: number;
      name: string;
      dob: string;
      parent_id: number;
      admitted_date: string;
    }>;
  };
  complaints: {
    total: number;
    pending: number;
    inProgress: number;
    solved: number;
    closed: number;
  };
  meetings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  events: {
    total: number;
    eventsList: Array<{
      event_id: number;
      topic: string;
      description: string;
      date: string;
      time: string;
      venue: string;
    }>;
  };
  attendance: {
    averageRate: number;
    totalStudents: number;
    attendedCount: number;
  };
}

export interface GenerateReportData {
  month: number;
  year: number;
  generated_by: number;
}

class SupervisorReportService {
  // Get all supervisor reports
  async getAllReports(): Promise<SupervisorReport[]> {
    try {
      const response = await axios.get(SUPERVISOR_REPORTS_URL);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching supervisor reports:", error);
      throw error;
    }
  }

  // Get report by ID
  async getReportById(reportId: number | string): Promise<SupervisorReport> {
    try {
      const response = await axios.get(`${SUPERVISOR_REPORTS_URL}/${reportId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching supervisor report:", error);
      throw error;
    }
  }

  // Get reports by month and year
  async getReportsByMonthYear(
    month: number,
    year: number
  ): Promise<SupervisorReport[]> {
    try {
      const response = await axios.get(
        `${SUPERVISOR_REPORTS_URL}/month/${month}/year/${year}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching reports by month/year:", error);
      throw error;
    }
  }

  // Get monthly data preview (without saving)
  async getMonthlyDataPreview(
    month: number,
    year: number
  ): Promise<MonthlyReportData> {
    try {
      const response = await axios.get(
        `${SUPERVISOR_REPORTS_URL}/preview/${month}/${year}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching monthly data preview:", error);
      throw error;
    }
  }

  // Generate new monthly report
  async generateMonthlyReport(
    reportData: GenerateReportData
  ): Promise<SupervisorReport> {
    try {
      const response = await axios.post(
        `${SUPERVISOR_REPORTS_URL}/generate`,
        reportData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error generating monthly report:", error);
      throw error;
    }
  }

  // Update report PDF path
  async updateReportPdf(
    reportId: number | string,
    pdfPath: string
  ): Promise<SupervisorReport> {
    try {
      const response = await axios.patch(
        `${SUPERVISOR_REPORTS_URL}/${reportId}/pdf`,
        { pdf_path: pdfPath }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating report PDF path:", error);
      throw error;
    }
  }

  // Delete report
  async deleteReport(reportId: number | string): Promise<void> {
    try {
      await axios.delete(`${SUPERVISOR_REPORTS_URL}/${reportId}`);
    } catch (error) {
      console.error("Error deleting supervisor report:", error);
      throw error;
    }
  }

  // Helper function to format month name
  getMonthName(month: number): string {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month - 1] || "";
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Helper function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}

export default new SupervisorReportService();
