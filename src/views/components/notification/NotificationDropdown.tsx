import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Clock, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    navigate(notification.link);
    onClose();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type: 'complaint' | 'meeting') => {
    if (type === 'complaint') {
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
    return <Calendar className="w-5 h-5 text-blue-500" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close notifications"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-16 h-16 text-gray-300 mb-3" />
            <p className="text-gray-500 text-center">No notifications yet</p>
            <p className="text-gray-400 text-sm text-center mt-1">
              You'll be notified of new complaints and meetings here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 ${
                      !notification.read ? 'font-semibold' : ''
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
