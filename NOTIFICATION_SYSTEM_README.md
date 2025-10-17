# Notification System for Supervisor Dashboard

This document explains the notification system implemented for the supervisor dashboard in the LittleSteps application.

## Overview

The notification system displays real-time notifications for:
- **New Complaints**: Complaints directed to the supervisor with "Pending" status
- **New Meeting Requests**: Meeting appointments with "pending" status

## Features

### 1. **Notification Badge**
- Red circular badge on the bell icon in the navbar
- Shows count of unread notifications (up to 9+)
- Animated ping effect for new notifications
- Updates automatically every 30 seconds

### 2. **Notification Dropdown**
- Click the bell icon to view all notifications
- Displays notification type (complaint/meeting), title, message, and timestamp
- Visual indicators:
  - Orange alert icon for complaints
  - Blue calendar icon for meetings
  - Blue dot for unread notifications
  - Blue background highlight for unread items

### 3. **Smart Time Display**
- "Just now" for recent notifications
- "X minutes/hours ago" for recent items
- "Yesterday" or specific date for older items

### 4. **Direct Navigation to Details**
- Click any notification to navigate directly to the specific complaint or meeting
- Automatically opens the detail modal for the relevant item
- No need to re-login or search for the item
- Seamless user experience with URL parameter handling

### 5. **Interactive Actions**
- Click any notification to navigate to the relevant page
- Mark individual notifications as read on click
- "Mark all as read" button to clear all unread notifications
- Click outside dropdown to close

### 5. **Auto-Refresh**
- Polls for new notifications every 30 seconds
- Initial fetch on component mount
- Maintains read/unread state in localStorage

## File Structure

```
LittleSteps-web_frontend/
├── src/
│   ├── services/
│   │   └── notificationService.ts          # API calls for notifications
│   ├── context/
│   │   └── NotificationContext.tsx         # State management for notifications
│   ├── views/
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   │   └── SupervisorNavbar.tsx   # Updated with notification UI
│   │   │   └── notification/
│   │   │       └── NotificationDropdown.tsx # Dropdown component
│   │   └── layouts/
│   │       └── SupervisorLayout.tsx       # Wrapped with NotificationProvider
```

## Implementation Details

### notificationService.ts
Handles all notification-related API calls:
- `getAllNotifications()`: Fetches both complaints and meetings
- `getNewComplaints()`: Gets pending complaints for supervisor
- `getNewMeetings()`: Gets pending meetings for supervisor
- `getNotificationCount()`: Returns unread count
- `markAsRead()`: Marks single notification as read
- `markAllAsRead()`: Marks all as read

### NotificationContext.tsx
Provides global state management:
- Stores notifications array
- Manages unread count
- Handles polling (30-second intervals)
- Provides functions: `refreshNotifications`, `markAsRead`, `markAllAsRead`

### NotificationDropdown.tsx
UI component for displaying notifications:
- Dropdown panel with notifications list
- Empty state when no notifications
- Timestamp formatting
- Click handlers for navigation
- Mark as read functionality

### SupervisorNavbar.tsx
Updated navbar with:
- Notification bell button
- Badge with unread count
- Animated ping effect
- Dropdown integration

## How It Works

### 1. Data Flow
```
Backend API → notificationService → NotificationContext → Components
                                           ↓
                                    localStorage (read state)
```

### 2. Notification Lifecycle
1. **Fetch**: Context fetches notifications on mount
2. **Poll**: Auto-refresh every 30 seconds
3. **Display**: Shows count in badge, list in dropdown
4. **Interact**: User clicks notification
5. **Navigate**: Redirects to relevant page
6. **Mark Read**: Updates state and localStorage

### 3. Navigation Links
- **Complaints**: `/supervisor/complaints?complaint_id={complaint_id}`
- **Meetings**: `/supervisor/appointments?meeting_id={meeting_id}`

When clicked, the notification navigates to the page and automatically opens the detail modal for that specific complaint or meeting.## Usage

The notification system is automatically active for all supervisor users. No additional setup required.

### For Developers

To modify notification behavior:

1. **Change polling interval**:
   ```typescript
   // In NotificationContext.tsx, change 30000 (30 seconds) to desired milliseconds
   const interval = setInterval(() => {
     refreshNotifications();
   }, 30000);
   ```

2. **Modify notification filters**:
   ```typescript
   // In notificationService.ts, adjust the filter conditions
   const newComplaints = complaints.filter(c => 
     c.status === 'Pending' || c.status === 'pending'
   );
   ```

3. **Add new notification types**:
   - Update the `Notification` interface in `notificationService.ts`
   - Add new fetch method in `NotificationService` class
   - Update `getAllNotifications()` to include new type
   - Add icon mapping in `NotificationDropdown.tsx`

## API Endpoints Used

- `GET /api/complaints/recipient/supervisor` - Fetch supervisor complaints
- `GET /api/meetings/recipient/supervisor` - Fetch supervisor meetings

## Browser Compatibility

- Uses localStorage for persistence
- Compatible with all modern browsers
- Gracefully handles API errors

## Performance Considerations

- Polling interval set to 30 seconds (balance between real-time and server load)
- Notifications cached in context to minimize API calls
- Read state stored in localStorage (no backend calls needed)
- Automatic cleanup on component unmount

## Future Enhancements

Potential improvements:
1. WebSocket integration for real-time notifications
2. Push notifications support
3. Notification preferences/settings
4. Filter notifications by type
5. Notification history page
6. Email notifications integration
7. Sound alerts for new notifications
8. Desktop notifications (browser API)

## Testing

To test the notification system:

1. **Create a new complaint**:
   - Status must be "Pending"
   - Recipient must be "supervisor"
   - Should appear in notifications within 30 seconds

2. **Create a new meeting**:
   - Status must be "pending"
   - Recipient must be "supervisor"
   - Should appear in notifications within 30 seconds

3. **Test interactions**:
   - Click bell icon to open dropdown
   - Click notification to navigate
   - Check if notification marked as read
   - Refresh page - read state should persist
   - Click "Mark all as read"

## Troubleshooting

### Notifications not appearing
- Check if backend API is running
- Verify API endpoints return correct data
- Check browser console for errors
- Ensure NotificationProvider wraps the layout

### Badge count incorrect
- Clear localStorage: `localStorage.removeItem('readNotifications')`
- Refresh notifications manually
- Check filter logic in `notificationService.ts`

### Navigation not working
- Verify route paths in notification service
- Check if routes are defined in routing configuration
- Ensure navigation links match actual routes

## Security Considerations

- Only supervisors can access supervisor notifications
- Backend validates user role before returning data
- No sensitive data stored in localStorage (only read IDs)
- All API calls use existing authentication

---

**Created**: October 17, 2025  
**Version**: 1.0  
**Maintainer**: Development Team
