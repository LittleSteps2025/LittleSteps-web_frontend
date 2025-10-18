# Dashboard API Documentation

This document describes the backend API endpoints required for the Admin Dashboard to function properly with real-time data.

## Base URL
```
http://localhost:5001/api/admin
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. Dashboard Statistics Endpoint

### GET `/api/admin/dashboard/stats`

Returns aggregated statistics for the dashboard overview.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Response Format
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalChildren": 45,
    "activeParents": 38,
    "activeTeachers": 12,
    "activeSupervisors": 5,
    "todayCheckIns": 32,
    "monthlyRevenue": 275000
  }
}
```

#### Field Descriptions
- `totalChildren` (number): Total number of registered children in the system
- `activeParents` (number): Number of active parent accounts
- `activeTeachers` (number): Number of active teacher accounts
- `activeSupervisors` (number): Number of active supervisor accounts
- `todayCheckIns` (number): Number of children checked in today
- `monthlyRevenue` (number): Total revenue for the current month (in LKR)

#### Example SQL Queries

```sql
-- Total Children
SELECT COUNT(*) as totalChildren FROM children WHERE status = 'active';

-- Active Parents
SELECT COUNT(DISTINCT parent_id) as activeParents FROM parents WHERE status = 'active';

-- Active Teachers
SELECT COUNT(*) as activeTeachers FROM users WHERE role = 'teacher' AND status = 'active';

-- Active Supervisors
SELECT COUNT(*) as activeSupervisors FROM users WHERE role = 'supervisor' AND status = 'active';

-- Today's Check-ins
SELECT COUNT(*) as todayCheckIns FROM attendance 
WHERE DATE(check_in_time) = CURDATE();

-- Monthly Revenue
SELECT COALESCE(SUM(amount), 0) as monthlyRevenue FROM payments 
WHERE MONTH(created_at) = MONTH(CURDATE()) 
AND YEAR(created_at) = YEAR(CURDATE())
AND status = 'paid';
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Unauthorized access. Please log in again."
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Failed to fetch dashboard statistics"
}
```

---

## 2. Recent Activities Endpoint

### GET `/api/admin/dashboard/activities?limit=10`

Returns recent user activities for the dashboard.

#### Query Parameters
- `limit` (optional, number): Maximum number of activities to return (default: 10)

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Response Format
```json
{
  "success": true,
  "message": "Recent activities retrieved successfully",
  "data": [
    {
      "id": 1,
      "activity_id": 1,
      "user_id": "123",
      "user": "Nimna Pathum",
      "user_name": "Nimna Pathum",
      "action": "checked in",
      "activity_type": "check-in",
      "type": "attendance",
      "timestamp": "2025-10-17T08:30:00Z",
      "description": "Child checked in successfully"
    },
    {
      "id": 2,
      "activity_id": 2,
      "user_id": "456",
      "user": "Irumi Theekshana",
      "user_name": "Irumi Theekshana",
      "action": "made payment",
      "activity_type": "payment",
      "type": "payment",
      "timestamp": "2025-10-17T08:15:00Z",
      "description": "Payment of LKR 5000 completed"
    },
    {
      "id": 3,
      "activity_id": 3,
      "user_id": "789",
      "user": "Nuwan Kumara",
      "user_name": "Nuwan Kumara",
      "action": "submitted complaint",
      "activity_type": "complaint",
      "type": "complaint",
      "timestamp": "2025-10-17T07:45:00Z",
      "description": "New complaint submitted"
    },
    {
      "id": 4,
      "activity_id": 4,
      "user_id": "101",
      "user": "Devinda Perera",
      "user_name": "Devinda Perera",
      "action": "registered child",
      "activity_type": "registration",
      "type": "registration",
      "timestamp": "2025-10-17T06:30:00Z",
      "description": "New child registered"
    }
  ]
}
```

#### Field Descriptions
- `id` / `activity_id` (number): Unique identifier for the activity
- `user_id` (string): ID of the user who performed the action
- `user` / `user_name` (string): Full name of the user
- `action` / `activity_type` (string): Type of action performed
- `type` (string): Category of the activity (attendance, payment, complaint, registration, etc.)
- `timestamp` (ISO 8601 string): When the activity occurred
- `description` (optional, string): Additional details about the activity

#### Example SQL Query

```sql
-- Recent Activities
SELECT 
  a.activity_id as id,
  a.user_id,
  CONCAT(u.first_name, ' ', u.last_name) as user,
  a.activity_type as action,
  a.type,
  a.created_at as timestamp,
  a.description
FROM activities a
LEFT JOIN users u ON a.user_id = u.user_id
ORDER BY a.created_at DESC
LIMIT ?;
```

#### Alternative: Union Query for Multiple Sources

```sql
-- Combine activities from different tables
(
  SELECT 
    attendance_id as id,
    child_id as user_id,
    CONCAT(c.first_name, ' ', c.last_name) as user,
    'checked in' as action,
    'attendance' as type,
    check_in_time as timestamp,
    NULL as description
  FROM attendance a
  LEFT JOIN children c ON a.child_id = c.child_id
  WHERE DATE(check_in_time) >= CURDATE() - INTERVAL 7 DAY
)
UNION ALL
(
  SELECT 
    payment_id as id,
    parent_id as user_id,
    CONCAT(p.first_name, ' ', p.last_name) as user,
    'made payment' as action,
    'payment' as type,
    created_at as timestamp,
    CONCAT('Payment of LKR ', amount) as description
  FROM payments pm
  LEFT JOIN parents p ON pm.parent_id = p.parent_id
  WHERE DATE(created_at) >= CURDATE() - INTERVAL 7 DAY
)
UNION ALL
(
  SELECT 
    complaint_id as id,
    user_id,
    CONCAT(u.first_name, ' ', u.last_name) as user,
    'submitted complaint' as action,
    'complaint' as type,
    created_at as timestamp,
    subject as description
  FROM complaints c
  LEFT JOIN users u ON c.user_id = u.user_id
  WHERE DATE(created_at) >= CURDATE() - INTERVAL 7 DAY
)
ORDER BY timestamp DESC
LIMIT ?;
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Unauthorized access. Please log in again."
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Failed to fetch recent activities"
}
```

---

## 3. Navigation Redirects

The dashboard now includes clickable elements that navigate to different pages:

### Stats Cards
- **Total Children** → `/admin/children`
- **Active Parents** → `/admin/parents`
- **Teachers** → `/admin/users`
- **Today's Check-ins** → `/admin/attendance`
- **Monthly Revenue** → `/admin/payments`

### Quick Actions
- **Send Announcement** → `/admin/announcements`
- **View Complaints** → `/admin/complaints`
- **Add New User** → `/admin/users`
- **Generate Report** → `/admin/reports`

### Recent Activities
- **View All** button → `/admin/activities`

---

## Implementation Notes

### Backend Implementation (Node.js/Express Example)

```javascript
// routes/admin/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {
      totalChildren: await getTotalChildren(),
      activeParents: await getActiveParents(),
      activeTeachers: await getActiveTeachers(),
      activeSupervisors: await getActiveSupervisors(),
      todayCheckIns: await getTodayCheckIns(),
      monthlyRevenue: await getMonthlyRevenue()
    };

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await getRecentActivities(limit);

    res.json({
      success: true,
      message: 'Recent activities retrieved successfully',
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
});

module.exports = router;
```

### Helper Functions Example

```javascript
async function getTotalChildren() {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM children WHERE status = "active"'
  );
  return rows[0].count;
}

async function getActiveParents() {
  const [rows] = await db.query(
    'SELECT COUNT(DISTINCT parent_id) as count FROM parents WHERE status = "active"'
  );
  return rows[0].count;
}

async function getTodayCheckIns() {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM attendance WHERE DATE(check_in_time) = CURDATE()'
  );
  return rows[0].count;
}

async function getMonthlyRevenue() {
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) as total FROM payments 
     WHERE MONTH(created_at) = MONTH(CURDATE()) 
     AND YEAR(created_at) = YEAR(CURDATE())
     AND status = 'paid'`
  );
  return rows[0].total;
}

async function getRecentActivities(limit = 10) {
  const [rows] = await db.query(
    `SELECT 
      a.activity_id as id,
      a.user_id,
      CONCAT(u.first_name, ' ', u.last_name) as user,
      a.activity_type as action,
      a.type,
      a.created_at as timestamp,
      a.description
     FROM activities a
     LEFT JOIN users u ON a.user_id = u.user_id
     ORDER BY a.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}
```

---

## Testing the API

### Using cURL

**Get Dashboard Stats:**
```bash
curl -X GET http://localhost:5001/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Get Recent Activities:**
```bash
curl -X GET "http://localhost:5001/api/admin/dashboard/activities?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Using Postman

1. Create a new GET request
2. URL: `http://localhost:5001/api/admin/dashboard/stats`
3. Headers:
   - `Authorization`: `Bearer YOUR_TOKEN`
   - `Content-Type`: `application/json`
4. Send request

---

## Frontend Usage

The dashboard automatically:
1. Fetches data on component mount
2. Shows loading state while fetching
3. Displays errors if API calls fail
4. Includes a refresh button to manually reload data
5. Redirects to appropriate pages when cards/actions are clicked

### Environment Variables

Make sure to set in `.env`:
```
VITE_API_BASE_URL=http://localhost:5001
```

---

## Database Schema Recommendations

### Activities Table (Optional)

If you want a dedicated activities table:

```sql
CREATE TABLE activities (
  activity_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id),
  INDEX idx_type (type)
);
```

---

## Support

For questions or issues, please contact the development team.

Last Updated: October 17, 2025
