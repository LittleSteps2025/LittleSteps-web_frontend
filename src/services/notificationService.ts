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
      console.log('🔔 [NotificationService] Fetching complaints for supervisor...');
      const complaints = await complaintService.getComplaintsByRecipient('supervisor');
      console.log('🔔 [NotificationService] Fetched complaints:', complaints);
      console.log('🔔 [NotificationService] Total complaints:', complaints.length);
      
      // Log each complaint's status for debugging
      complaints.forEach((c, index) => {
        console.log(`🔔 [NotificationService] Complaint ${index + 1}: status="${c.status}" (length: ${c.status?.length}, type: ${typeof c.status})`);
      });
      
      // Filter for new/pending complaints - case insensitive and trimmed
      const newComplaints = complaints.filter(c => {
        const statusLower = c.status?.toString().toLowerCase().trim();
        const isPending = statusLower === 'pending';
        console.log(`🔔 [NotificationService] Checking complaint ${c.complaint_id}: original status="${c.status}", normalized="${statusLower}", isPending=${isPending}`);
        return isPending;
      });
      console.log('🔔 [NotificationService] Pending complaints:', newComplaints);
      console.log('🔔 [NotificationService] Pending count:', newComplaints.length);
      
      const notifications = newComplaints.map(complaint => ({
        id: `complaint-${complaint.complaint_id}`,
        type: 'complaint' as const,
        title: 'New Complaint Received',
        message: `${complaint.subject} from ${complaint.parent_name}`,
        timestamp: complaint.date,
        read: false,
        data: complaint,
        link: `/supervisor/complaints?complaint_id=${complaint.complaint_id}`
      }));
      
      console.log('🔔 [NotificationService] Complaint notifications created:', notifications);
      return notifications;
    } catch (error) {
      console.error('❌ [NotificationService] Error fetching new complaints:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
      }
      return [];
    }
  }

  // Get pending meetings for supervisor
  async getNewMeetings(): Promise<Notification[]> {
    try {
      console.log('🔔 [NotificationService] Fetching meetings for supervisor...');
      const meetings = await meetingService.getMeetingsByRecipient('supervisor');
      console.log('🔔 [NotificationService] Fetched meetings:', meetings);
      console.log('🔔 [NotificationService] Total meetings:', meetings.length);
      
      // Log each meeting's status for debugging
      meetings.forEach((m, index) => {
        console.log(`🔔 [NotificationService] Meeting ${index + 1}: status="${m.status}" (length: ${m.status?.length}, type: ${typeof m.status})`);
      });
      
      // Filter for pending meetings - case insensitive and trimmed
      const newMeetings = meetings.filter(m => {
        const statusLower = m.status?.toString().toLowerCase().trim();
        const isPending = statusLower === 'pending';
        console.log(`🔔 [NotificationService] Checking meeting ${m.meeting_id}: original status="${m.status}", normalized="${statusLower}", isPending=${isPending}`);
        return isPending;
      });
      console.log('🔔 [NotificationService] Pending meetings:', newMeetings);
      console.log('🔔 [NotificationService] Pending count:', newMeetings.length);
      
      const notifications = newMeetings.map(meeting => ({
        id: `meeting-${meeting.meeting_id}`,
        type: 'meeting' as const,
        title: 'New Meeting Request',
        message: `Meeting with ${meeting.parent_name} on ${new Date(meeting.meeting_date).toLocaleDateString()}`,
        timestamp: meeting.meeting_date,
        read: false,
        data: meeting,
        link: `/supervisor/appointments?meeting_id=${meeting.meeting_id}`
      }));
      
      console.log('🔔 [NotificationService] Meeting notifications created:', notifications);
      return notifications;
    } catch (error) {
      console.error('❌ [NotificationService] Error fetching new meetings:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
      }
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
