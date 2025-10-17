import complaintService, { type Complaint } from './complaintService';
import meetingService, { type Meeting } from './meetingService';

export interface Notification {
  id: string;
  type: 'complaint' | 'meeting';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data: Complaint | Meeting;
  link: string; // Navigation link when clicked
}

class NotificationService {
  // Get unread complaints for supervisor
  async getNewComplaints(): Promise<Notification[]> {
    try {
      const complaints = await complaintService.getComplaintsByRecipient('supervisor');
      
      // Filter for new/pending complaints (you can adjust the filter logic)
      const newComplaints = complaints.filter(c => 
        c.status === 'Pending' || c.status === 'pending'
      );
      
      return newComplaints.map(complaint => ({
        id: `complaint-${complaint.complaint_id}`,
        type: 'complaint' as const,
        title: 'New Complaint Received',
        message: `${complaint.subject} from ${complaint.parent_name}`,
        timestamp: complaint.date,
        read: false,
        data: complaint,
        link: `/supervisor/complaints?complaint_id=${complaint.complaint_id}`
      }));
    } catch (error) {
      console.error('Error fetching new complaints:', error);
      return [];
    }
  }

  // Get pending meetings for supervisor
  async getNewMeetings(): Promise<Notification[]> {
    try {
      const meetings = await meetingService.getMeetingsByRecipient('supervisor');
      
      // Filter for pending meetings
      const newMeetings = meetings.filter(m => 
        m.status === 'pending'
      );
      
      return newMeetings.map(meeting => ({
        id: `meeting-${meeting.meeting_id}`,
        type: 'meeting' as const,
        title: 'New Meeting Request',
        message: `Meeting with ${meeting.parent_name} on ${new Date(meeting.meeting_date).toLocaleDateString()}`,
        timestamp: meeting.meeting_date,
        read: false,
        data: meeting,
        link: `/supervisor/appointments?meeting_id=${meeting.meeting_id}`
      }));
    } catch (error) {
      console.error('Error fetching new meetings:', error);
      return [];
    }
  }

  // Get all notifications
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const [complaints, meetings] = await Promise.all([
        this.getNewComplaints(),
        this.getNewMeetings()
      ]);

      // Combine and sort by timestamp (newest first)
      const allNotifications = [...complaints, ...meetings].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      return allNotifications;
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      return [];
    }
  }

  // Get notification count
  async getNotificationCount(): Promise<number> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      return 0;
    }
  }

  // Mark notification as read (stored in localStorage)
  markAsRead(notificationId: string): void {
    try {
      const readNotifications = this.getReadNotifications();
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  markAllAsRead(notificationIds: string[]): void {
    try {
      const readNotifications = this.getReadNotifications();
      const updatedRead = [...new Set([...readNotifications, ...notificationIds])];
      localStorage.setItem('readNotifications', JSON.stringify(updatedRead));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Get read notifications from localStorage
  getReadNotifications(): string[] {
    try {
      const stored = localStorage.getItem('readNotifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting read notifications:', error);
      return [];
    }
  }

  // Clear read notifications (optional - for cleanup)
  clearReadNotifications(): void {
    try {
      localStorage.removeItem('readNotifications');
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  }
}

export default new NotificationService();
