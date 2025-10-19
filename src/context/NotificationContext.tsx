import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import notificationService, { type Notification } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from the service
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔔 [NotificationContext] Fetching notifications...');
      const fetchedNotifications = await notificationService.getAllNotifications();
      console.log('🔔 [NotificationContext] Fetched notifications:', fetchedNotifications);
      console.log('🔔 [NotificationContext] Total fetched:', fetchedNotifications.length);
      
      const readNotifications = notificationService.getReadNotifications();
      console.log('🔔 [NotificationContext] Read notifications from localStorage:', readNotifications);
      
      // Mark notifications as read based on localStorage
      const updatedNotifications = fetchedNotifications.map(notif => ({
        ...notif,
        read: readNotifications.includes(notif.id)
      }));
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      console.log('🔔 [NotificationContext] Unread count:', unreadCount);
      console.log('🔔 [NotificationContext] Updated notifications:', updatedNotifications);
      
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('❌ [NotificationContext] Error refreshing notifications:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    notificationService.markAllAsRead(allIds);
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, [notifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initial fetch
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export { NotificationContext };
