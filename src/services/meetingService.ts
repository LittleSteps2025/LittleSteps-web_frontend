import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export interface Meeting {
  meeting_id: number;
  child_id: number;
  recipient: 'teacher' | 'supervisor';
  meeting_date: string;
  meeting_time: string;
  reason: string;
  response?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  child_name: string;
  child_age: number;
  child_gender: string;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_address: string;
}

export interface CreateMeetingData {
  child_id: number;
  recipient: 'teacher' | 'supervisor';
  meeting_date: string;
  meeting_time: string;
  reason: string;
  response?: string;
}

export interface UpdateMeetingData {
  meeting_date: string;
  meeting_time: string;
  reason: string;
  response?: string;
}

export interface SearchParams {
  searchTerm?: string;
  recipient?: string;
  response?: string;
  dateFrom?: string;
  dateTo?: string;
}

class MeetingService {
  // Get all meetings
  async getAllMeetings(): Promise<Meeting[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  // Get meeting by ID
  async getMeetingById(meetingId: number): Promise<Meeting> {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/${meetingId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  }

  // Get meetings by child ID
  async getMeetingsByChildId(childId: number): Promise<Meeting[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/child/${childId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching child meetings:', error);
      throw error;
    }
  }

  // Get meetings by recipient
  async getMeetingsByRecipient(recipient: 'teacher' | 'supervisor'): Promise<Meeting[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/recipient/${recipient}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recipient meetings:', error);
      throw error;
    }
  }

  // Create new meeting
  async createMeeting(meetingData: CreateMeetingData): Promise<Meeting> {
    try {
      const response = await axios.post(`${API_BASE_URL}/meetings`, meetingData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  // Update meeting
  async updateMeeting(meetingId: number, meetingData: UpdateMeetingData): Promise<Meeting> {
    try {
      const response = await axios.put(`${API_BASE_URL}/meetings/${meetingId}`, meetingData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  // Update meeting response only
  async updateMeetingResponse(meetingId: number, response: string): Promise<Meeting> {
    try {
      const response_data = await axios.patch(`${API_BASE_URL}/meetings/${meetingId}/response`, { response });
      return response_data.data.data;
    } catch (error) {
      console.error('Error updating meeting response:', error);
      throw error;
    }
  }

  // Update meeting status
  async updateMeetingStatus(meetingId: number, status: 'pending' | 'confirmed' | 'cancelled'): Promise<Meeting> {
    try {
      console.log('=== SERVICE: updateMeetingStatus ===');
      console.log('Meeting ID:', meetingId);
      console.log('Status:', status);
      console.log('URL:', `${API_BASE_URL}/meetings/${meetingId}/status`);
      console.log('Payload:', { status });
      
      const response = await axios.patch(`${API_BASE_URL}/meetings/${meetingId}/status`, { status });
      console.log('Response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating meeting status:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/meetings/${meetingId}`);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  // Search meetings with filters
  async searchMeetings(searchParams: SearchParams): Promise<Meeting[]> {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.searchTerm) {
        params.append('searchTerm', searchParams.searchTerm);
      }
      if (searchParams.recipient) {
        params.append('recipient', searchParams.recipient);
      }
      if (searchParams.response) {
        params.append('response', searchParams.response);
      }
      if (searchParams.dateFrom) {
        params.append('dateFrom', searchParams.dateFrom);
      }
      if (searchParams.dateTo) {
        params.append('dateTo', searchParams.dateTo);
      }

      const response = await axios.get(`${API_BASE_URL}/meetings/search?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error searching meetings:', error);
      throw error;
    }
  }
}

export default new MeetingService();
