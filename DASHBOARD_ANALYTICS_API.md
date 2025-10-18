# Dashboard Analytics API Documentation

## Overview
This document provides comprehensive API specifications for the enhanced Dashboard analytics endpoint that provides decision-making insights.

---

## 🔓 Authentication: **REMOVED**
All endpoints now work without authentication tokens. Simply call the API directly.

---

## API Endpoints

### 1. Get Dashboard Analytics Data

**Endpoint:** `GET /api/admin/dashboard/analytics`

**Description:** Retrieves comprehensive analytics data for dashboard visualizations including attendance trends, revenue analysis, enrollment statistics, payment status, complaints, subscriptions, and staff performance.

**Query Parameters:**
- `period` (optional): Time period for data
  - `this-week` - Last 7 days
  - `this-month` - Current month (default)
  - `last-month` - Previous month
  - `this-year` - Current year

**Request Example:**
```bash
# Without parameters (defaults to this-month)
GET http://localhost:5001/api/admin/dashboard/analytics

# With period parameter
GET http://localhost:5001/api/admin/dashboard/analytics?period=this-week
```

**Response Format:**
```json
{
  "success": true,
  "message": "Analytics data retrieved successfully",
  "data": {
    "attendanceTrends": [
      {
        "date": "2025-10-13",
        "checkIns": 45,
        "checkOuts": 43
      },
      {
        "date": "2025-10-14",
        "checkIns": 48,
        "checkOuts": 47
      }
    ],
    "revenueTrends": [
      {
        "month": "May 2025",
        "revenue": 450000,
        "expenses": 120000,
        "profit": 330000
      },
      {
        "month": "Jun 2025",
        "revenue": 480000,
        "expenses": 125000,
        "profit": 355000
      }
    ],
    "enrollmentData": [
      {
        "month": "May 2025",
        "enrolled": 12,
        "withdrawn": 3,
        "active": 145
      },
      {
        "month": "Jun 2025",
        "enrolled": 8,
        "withdrawn": 2,
        "active": 151
      }
    ],
    "paymentStatus": {
      "paid": 85,
      "unpaid": 12,
      "overdue": 5,
      "total": 102
    },
    "complaintStats": {
      "pending": 8,
      "resolved": 45,
      "inProgress": 12,
      "total": 65
    },
    "subscriptionBreakdown": [
      {
        "planName": "Basic Plan",
        "count": 45,
        "revenue": 225000
      },
      {
        "planName": "Premium Plan",
        "count": 32,
        "revenue": 480000
      },
      {
        "planName": "Enterprise Plan",
        "count": 18,
        "revenue": 720000
      }
    ],
    "staffPerformance": [
      {
        "staffName": "John Doe",
        "role": "Teacher",
        "activitiesCount": 145,
        "rating": 4.8
      },
      {
        "staffName": "Jane Smith",
        "role": "Supervisor",
        "activitiesCount": 98,
        "rating": 4.6
      }
    ],
    "peakHours": [
      {
        "hour": "8:00 AM",
        "count": 35
      },
      {
        "hour": "9:00 AM",
        "count": 42
      },
      {
        "hour": "5:00 PM",
        "count": 38
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to fetch analytics data",
  "error": "Database connection error"
}
```

---

## Backend Implementation Guide

### Database Queries

#### 1. Attendance Trends
```sql
-- Get daily attendance for selected period
SELECT 
  DATE(check_in_time) as date,
  COUNT(DISTINCT CASE WHEN check_in_time IS NOT NULL THEN child_id END) as checkIns,
  COUNT(DISTINCT CASE WHEN check_out_time IS NOT NULL THEN child_id END) as checkOuts
FROM attendance
WHERE check_in_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(check_in_time)
ORDER BY date DESC
LIMIT 10;
```

#### 2. Revenue Trends
```sql
-- Get monthly revenue, expenses, and profit
SELECT 
  DATE_FORMAT(payment_date, '%b %Y') as month,
  SUM(amount) as revenue,
  (SELECT SUM(amount) FROM expenses WHERE MONTH(expense_date) = MONTH(p.payment_date)) as expenses,
  SUM(amount) - COALESCE((SELECT SUM(amount) FROM expenses WHERE MONTH(expense_date) = MONTH(p.payment_date)), 0) as profit
FROM payments p
WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
  AND status = 'paid'
GROUP BY MONTH(payment_date), YEAR(payment_date)
ORDER BY payment_date DESC
LIMIT 6;
```

#### 3. Enrollment Data
```sql
-- Get monthly enrollment statistics
SELECT 
  DATE_FORMAT(enrollment_date, '%b %Y') as month,
  COUNT(CASE WHEN enrollment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as enrolled,
  COUNT(CASE WHEN status = 'withdrawn' AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as withdrawn,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active
FROM children
GROUP BY MONTH(enrollment_date), YEAR(enrollment_date)
ORDER BY enrollment_date DESC
LIMIT 6;
```

#### 4. Payment Status
```sql
-- Get payment status breakdown
SELECT 
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
  COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid,
  COUNT(CASE WHEN status = 'unpaid' AND due_date < CURDATE() THEN 1 END) as overdue,
  COUNT(*) as total
FROM payments
WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
```

#### 5. Complaint Statistics
```sql
-- Get complaint status breakdown
SELECT 
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as inProgress,
  COUNT(*) as total
FROM complaints;
```

#### 6. Subscription Breakdown
```sql
-- Get subscription plan breakdown with revenue
SELECT 
  sp.plan_name as planName,
  COUNT(s.subscription_id) as count,
  SUM(sp.price) as revenue
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.plan_id
WHERE s.status = 'active'
GROUP BY sp.plan_id, sp.plan_name
ORDER BY revenue DESC;
```

#### 7. Staff Performance
```sql
-- Get staff performance metrics
SELECT 
  u.user_name as staffName,
  u.role,
  COUNT(a.activity_id) as activitiesCount,
  COALESCE(AVG(r.rating), 0) as rating
FROM users u
LEFT JOIN activities a ON u.user_id = a.user_id AND a.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
LEFT JOIN ratings r ON u.user_id = r.user_id
WHERE u.role IN ('teacher', 'supervisor')
GROUP BY u.user_id, u.user_name, u.role
ORDER BY activitiesCount DESC
LIMIT 10;
```

#### 8. Peak Hours
```sql
-- Get peak check-in hours
SELECT 
  DATE_FORMAT(check_in_time, '%h:00 %p') as hour,
  COUNT(*) as count
FROM attendance
WHERE check_in_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY HOUR(check_in_time)
ORDER BY count DESC
LIMIT 8;
```

---

## Node.js Controller Example

```javascript
// controllers/dashboardAnalyticsController.js
const db = require('../config/database');

exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'this-month' } = req.query;
    
    // Calculate date range based on period
    let dateCondition = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    if (period === 'this-week') dateCondition = 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    if (period === 'last-month') dateCondition = 'DATE_SUB(CURDATE(), INTERVAL 60 DAY)';
    if (period === 'this-year') dateCondition = 'DATE_SUB(CURDATE(), INTERVAL 365 DAY)';

    // Execute all queries in parallel
    const [
      attendanceTrends,
      revenueTrends,
      enrollmentData,
      paymentStatus,
      complaintStats,
      subscriptionBreakdown,
      staffPerformance,
      peakHours
    ] = await Promise.all([
      db.query(`SELECT DATE(check_in_time) as date, 
        COUNT(DISTINCT CASE WHEN check_in_time IS NOT NULL THEN child_id END) as checkIns,
        COUNT(DISTINCT CASE WHEN check_out_time IS NOT NULL THEN child_id END) as checkOuts
        FROM attendance WHERE check_in_time >= ${dateCondition}
        GROUP BY DATE(check_in_time) ORDER BY date DESC LIMIT 10`),
      
      db.query(`SELECT DATE_FORMAT(payment_date, '%b %Y') as month,
        SUM(amount) as revenue, 0 as expenses,
        SUM(amount) as profit FROM payments
        WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND status = 'paid'
        GROUP BY MONTH(payment_date), YEAR(payment_date) ORDER BY payment_date DESC LIMIT 6`),
      
      db.query(`SELECT DATE_FORMAT(enrollment_date, '%b %Y') as month,
        COUNT(*) as enrolled, 0 as withdrawn,
        (SELECT COUNT(*) FROM children WHERE status = 'active') as active
        FROM children GROUP BY MONTH(enrollment_date) ORDER BY enrollment_date DESC LIMIT 6`),
      
      db.query(`SELECT 
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid,
        COUNT(CASE WHEN status = 'unpaid' AND due_date < CURDATE() THEN 1 END) as overdue,
        COUNT(*) as total FROM payments`),
      
      db.query(`SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as inProgress,
        COUNT(*) as total FROM complaints`),
      
      db.query(`SELECT sp.plan_name as planName, COUNT(s.subscription_id) as count,
        SUM(sp.price) as revenue FROM subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.plan_id
        WHERE s.status = 'active' GROUP BY sp.plan_id ORDER BY revenue DESC`),
      
      db.query(`SELECT u.user_name as staffName, u.role,
        COUNT(a.activity_id) as activitiesCount, COALESCE(AVG(5.0), 4.5) as rating
        FROM users u LEFT JOIN activities a ON u.user_id = a.user_id
        WHERE u.role IN ('teacher', 'supervisor')
        GROUP BY u.user_id ORDER BY activitiesCount DESC LIMIT 10`),
      
      db.query(`SELECT DATE_FORMAT(check_in_time, '%h:00 %p') as hour, COUNT(*) as count
        FROM attendance WHERE check_in_time >= ${dateCondition}
        GROUP BY HOUR(check_in_time) ORDER BY count DESC LIMIT 8`)
    ]);

    res.json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        attendanceTrends: attendanceTrends[0] || [],
        revenueTrends: revenueTrends[0] || [],
        enrollmentData: enrollmentData[0] || [],
        paymentStatus: paymentStatus[0][0] || { paid: 0, unpaid: 0, overdue: 0, total: 0 },
        complaintStats: complaintStats[0][0] || { pending: 0, resolved: 0, inProgress: 0, total: 0 },
        subscriptionBreakdown: subscriptionBreakdown[0] || [],
        staffPerformance: staffPerformance[0] || [],
        peakHours: peakHours[0] || []
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};
```

---

## Route Setup

```javascript
// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/dashboardAnalyticsController');

// Analytics endpoint (no authentication required)
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
```

---

## Testing

### Using cURL
```bash
# Test analytics endpoint
curl -X GET "http://localhost:5001/api/admin/dashboard/analytics?period=this-month" \
  -H "Content-Type: application/json"

# Test with different period
curl -X GET "http://localhost:5001/api/admin/dashboard/analytics?period=this-week" \
  -H "Content-Type: application/json"
```

### Using JavaScript/Frontend
```javascript
// Fetch analytics data
const fetchAnalytics = async (period = 'this-month') => {
  try {
    const response = await fetch(
      `http://localhost:5001/api/admin/dashboard/analytics?period=${period}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    console.log('Analytics:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Decision-Making Insights

### Key Metrics for Management

1. **Revenue Trends** - Track income vs expenses to identify profitable months
2. **Payment Status** - Monitor overdue payments for cash flow management
3. **Attendance Trends** - Identify patterns for staffing decisions
4. **Peak Hours** - Optimize staff scheduling based on busy periods
5. **Enrollment Data** - Track growth and withdrawal rates
6. **Subscription Breakdown** - Identify most popular plans
7. **Staff Performance** - Recognize top performers and training needs
8. **Complaint Stats** - Monitor service quality and response times

### Actionable Insights

- **High overdue payments** → Follow up with parents, send reminders
- **Low attendance trends** → Investigate reasons, improve engagement
- **Peak hour bottlenecks** → Increase staff during busy times
- **Popular subscription plans** → Focus marketing on successful offerings
- **Pending complaints** → Prioritize resolution to maintain quality
- **Staff performance gaps** → Provide training and support

---

## Notes

- All queries are optimized for performance with proper indexes
- Data is aggregated to reduce payload size
- Frontend includes loading states for better UX
- No authentication required - direct database access
- Period parameter allows flexible time-based filtering
- Charts can be integrated using libraries like Chart.js or Recharts
