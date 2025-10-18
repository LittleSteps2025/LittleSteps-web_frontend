import axios from "axios";
import { API_BASE_URL } from "../config/api";

export interface Complaint {
  complaint_id: number;
  date: string;
  subject: string;
  recipient: "teacher" | "supervisor";
  description: string;
  status: string;
  action?: string;
  child_id: number;
  child_name: string;
  child_age: number;
  child_gender: string;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_address: string;
}

export interface CreateComplaintData {
  date: string;
  subject: string;
  recipient: "teacher" | "supervisor";
  description: string;
  status?: string;
  action?: string;
  child_id: number;
}

export interface UpdateComplaintData {
  date: string;
  subject: string;
  recipient: "teacher" | "supervisor";
  description: string;
  status?: string;
  action?: string;
}

export interface SearchParams {
  searchTerm?: string;
  recipient?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

class ComplaintService {
  // Get all complaints
  async getAllComplaints(): Promise<Complaint[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/complaints`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching complaints:", error);
      throw error;
    }
  }

  // Get complaint by ID
  async getComplaintById(complaintId: number): Promise<Complaint> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/complaints/${complaintId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching complaint:", error);
      throw error;
    }
  }

  // Get complaints by child ID
  async getComplaintsByChildId(childId: number): Promise<Complaint[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/complaints/child/${childId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching child complaints:", error);
      throw error;
    }
  }

  // Get complaints by recipient
  async getComplaintsByRecipient(
    recipient: "teacher" | "supervisor"
  ): Promise<Complaint[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/complaints/recipient/${recipient}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching recipient complaints:", error);
      throw error;
    }
  }

  // Create new complaint
  async createComplaint(
    complaintData: CreateComplaintData
  ): Promise<Complaint> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/complaints`,
        complaintData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating complaint:", error);
      throw error;
    }
  }

  // Update complaint
  async updateComplaint(
    complaintId: number,
    complaintData: UpdateComplaintData
  ): Promise<Complaint> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/complaints/${complaintId}`,
        complaintData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating complaint:", error);
      throw error;
    }
  }

  // Update complaint status only
  async updateComplaintStatus(
    complaintId: number,
    status: string
  ): Promise<Complaint> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/complaints/${complaintId}/status`,
        { status }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating complaint status:", error);
      throw error;
    }
  }

  // Update complaint action only
  async updateComplaintAction(
    complaintId: number,
    action: string
  ): Promise<Complaint> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/complaints/${complaintId}/action`,
        { action }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating complaint action:", error);
      throw error;
    }
  }

  // Delete complaint
  async deleteComplaint(complaintId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/complaints/${complaintId}`);
    } catch (error) {
      console.error("Error deleting complaint:", error);
      throw error;
    }
  }

  // Search complaints with filters
  async searchComplaints(searchParams: SearchParams): Promise<Complaint[]> {
    try {
      const params = new URLSearchParams();

      if (searchParams.searchTerm) {
        params.append("searchTerm", searchParams.searchTerm);
      }
      if (searchParams.recipient) {
        params.append("recipient", searchParams.recipient);
      }
      if (searchParams.status) {
        params.append("status", searchParams.status);
      }
      if (searchParams.dateFrom) {
        params.append("dateFrom", searchParams.dateFrom);
      }
      if (searchParams.dateTo) {
        params.append("dateTo", searchParams.dateTo);
      }

      const response = await axios.get(
        `${API_BASE_URL}/complaints/search?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error searching complaints:", error);
      throw error;
    }
  }
}

export default new ComplaintService();
