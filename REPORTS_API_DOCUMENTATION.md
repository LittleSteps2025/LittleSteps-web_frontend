# Reports API Documentation

This document describes the backend API endpoints required for the Reports Center to function properly with real-time data.

## Base URL
```
http://localhost:5001/api/admin/reports
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. Generate Report Endpoint

### POST `/api/admin/reports/generate`

Generates a new report based on specified parameters and returns a download URL.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "reportType": "attendance",
  "dateRange": {
    "start": "2025-09-01",
    "end": "2025-10-17"
  },
  "format": "pdf",
  "groupBy": "daily",
  "detailLevel": "summary"
}
```

#### Request Parameters

| Parameter | Type | Required | Description | Values |
|-----------|------|----------|-------------|--------|
| reportType | string | Yes | Type of report to generate | attendance, financial, enrollment, staff, incidents, mis |
| dateRange.start | string (date) | Yes | Start date for report data | YYYY-MM-DD |
| dateRange.end | string (date) | Yes | End date for report data | YYYY-MM-DD |
| format | string | Yes | Output format | pdf, csv, excel |
| groupBy | string | No | Grouping option (attendance) | daily, child, classroom, period |
| detailLevel | string | No | Detail level (financial) | summary, detailed, outstanding, methods |

#### Response Format
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "admin_report_id": "ARPT-20251017-001",
    "name": "Attendance Report - Oct 2025",
    "type": "attendance",
    "format": "pdf",
    "size": "2.4 MB",
    "download_url": "http://localhost:5001/api/admin/reports/download/ARPT-20251017-001",
    "created_at": "2025-10-17T10:30:00Z",
    "generated_by": "Admin User"
  }
}
```

#### Report Types Details

**1. Attendance Report (`attendance`)**
- Daily check-ins/check-outs with timestamps
- Attendance rates and trends
- Late arrivals and early departures
- Missing check-outs

**2. Financial Report (`financial`)**
- Revenue breakdown by payment method
- Outstanding balances
- Payment history
- Monthly/quarterly summaries

**3. Enrollment Report (`enrollment`)**
- Current enrollment numbers
- Historical enrollment trends
- Age group distribution
- Registration statistics

**4. Staff Activity Report (`staff`)**
- Teacher and supervisor activities
- Work hours and schedules
- Performance metrics
- Incident logs

**5. Incident Reports (`incidents`)**
- Recorded incidents and complaints
- Resolution status
- Severity levels
- Timeline analysis

**6. MIS Summary Report (`mis`)**
- Management Information System dashboard
- Key performance indicators
- Comparative analysis
- Trend forecasting

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Invalid date range. End date must be after start date."
}
```

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
  "message": "Failed to generate report. Please try again."
}
```

---

## 2. Report History Endpoint

### GET `/api/admin/reports/history?limit=10`

Returns a list of previously generated reports.

#### Query Parameters
- `limit` (optional, number): Maximum number of reports to return (default: 10)
- `type` (optional, string): Filter by report type
- `format` (optional, string): Filter by format

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Response Format
```json
{
  "success": true,
  "message": "Report history retrieved successfully",
  "data": [
    {
      "admin_report_id": "ARPT-20251017-001",
      "name": "Monthly Attendance Report",
      "type": "attendance",
      "format": "pdf",
      "size": "2.4 MB",
      "created_at": "2025-10-17T10:30:00Z",
      "download_url": "http://localhost:5001/api/admin/reports/download/ARPT-20251017-001",
      "generated_by": "Admin User"
    },
    {
      "admin_report_id": "ARPT-20251015-002",
      "name": "Financial Q3 Report",
      "type": "financial",
      "format": "excel",
      "size": "1.8 MB",
      "created_at": "2025-10-15T14:20:00Z",
      "download_url": "http://localhost:5001/api/admin/reports/download/ARPT-20251015-002",
      "generated_by": "Admin User"
    }
  ]
}
```

#### Field Descriptions
- `admin_report_id` (string): Unique identifier for the admin report
- `name` (string): Human-readable report name
- `type` (string): Report category
- `format` (string): File format (pdf, csv, excel)
- `size` (string): File size in human-readable format
- `created_at` (ISO 8601 string): When the report was generated
- `download_url` (string): Direct download link for the report
- `generated_by` (string): Name of the user who generated the report

#### Example SQL Query

```sql
SELECT 
  r.admin_report_id,
  r.name,
  r.type,
  r.format,
  CONCAT(ROUND(r.file_size / 1024 / 1024, 1), ' MB') as size,
  r.created_at,
  CONCAT(u.first_name, ' ', u.last_name) as generated_by,
  CONCAT('/api/admin/reports/download/', r.admin_report_id) as download_url
FROM admin_reports r
LEFT JOIN users u ON r.user_id = u.user_id
ORDER BY r.created_at DESC
LIMIT ?;
```

---

## 3. Quick Stats Endpoint

### GET `/api/admin/reports/quick-stats`

Returns quick statistics for the MIS sidebar.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Response Format
```json
{
  "success": true,
  "message": "Quick stats retrieved successfully",
  "data": {
    "currentEnrollment": 245,
    "monthlyAttendanceAvg": 89,
    "revenueThisMonth": 1254000,
    "staffCount": 33
  }
}
```

#### Field Descriptions
- `currentEnrollment` (number): Total number of currently enrolled children
- `monthlyAttendanceAvg` (number): Average attendance percentage for current month
- `revenueThisMonth` (number): Total revenue for current month (in LKR)
- `staffCount` (number): Total number of active staff members

#### Example SQL Queries

```sql
-- Current Enrollment
SELECT COUNT(*) as currentEnrollment 
FROM children 
WHERE status = 'active';

-- Monthly Attendance Average
SELECT ROUND(AVG(attendance_rate), 0) as monthlyAttendanceAvg
FROM (
  SELECT 
    DATE(check_in_time) as date,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM children WHERE status = 'active') as attendance_rate
  FROM attendance
  WHERE MONTH(check_in_time) = MONTH(CURDATE())
    AND YEAR(check_in_time) = YEAR(CURDATE())
  GROUP BY DATE(check_in_time)
) as daily_attendance;

-- Revenue This Month
SELECT COALESCE(SUM(amount), 0) as revenueThisMonth
FROM payments
WHERE MONTH(created_at) = MONTH(CURDATE())
  AND YEAR(created_at) = YEAR(CURDATE())
  AND status = 'paid';

-- Staff Count
SELECT COUNT(*) as staffCount
FROM users
WHERE role IN ('teacher', 'supervisor', 'admin')
  AND status = 'active';
```

---

## 4. Download Report Endpoint

### GET `/api/admin/reports/download/:adminReportId`

Downloads a previously generated report file.

#### URL Parameters
- `adminReportId` (string): The unique identifier of the admin report to download

#### Request Headers
```
Authorization: Bearer <token>
```

#### Response
Binary file stream with appropriate content type headers:
```
Content-Type: application/pdf | application/vnd.ms-excel | text/csv
Content-Disposition: attachment; filename="report-name.pdf"
Content-Length: <file-size>
```

#### Example Implementation (Node.js)

```javascript
router.get('/download/:adminReportId', authenticateToken, async (req, res) => {
  try {
    const { adminReportId } = req.params;
    
    // Get report metadata from database
    const [reports] = await db.query(
      'SELECT * FROM admin_reports WHERE admin_report_id = ?',
      [adminReportId]
    );
    
    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    const report = reports[0];
    const filePath = path.join(__dirname, '../../uploads/reports', report.file_path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Report file not found'
      });
    }
    
    // Set appropriate headers
    const contentType = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }[report.format] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.name}.${report.format}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report'
    });
  }
});
```

---

## 5. Export All Data Endpoint

### POST `/api/admin/reports/export-all`

Exports all system data as a compressed archive.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "format": "zip"
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Data export initiated successfully",
  "data": {
    "export_id": "EXP-20251017-001",
    "download_url": "http://localhost:5001/api/admin/reports/download-export/EXP-20251017-001",
    "estimated_size": "125 MB",
    "includes": [
      "children_data",
      "parents_data",
      "staff_data",
      "attendance_records",
      "payment_records",
      "announcements",
      "complaints"
    ]
  }
}
```

---

## Backend Implementation Example

### Main Routes File

```javascript
// routes/admin/reports.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const reportController = require('../../controllers/reportController');

// Generate report
router.post('/generate', authenticateToken, reportController.generateReport);

// Get report history
router.get('/history', authenticateToken, reportController.getReportHistory);

// Get quick stats
router.get('/quick-stats', authenticateToken, reportController.getQuickStats);

// Download report
router.get('/download/:reportId', authenticateToken, reportController.downloadReport);

// Export all data
router.post('/export-all', authenticateToken, reportController.exportAllData);

module.exports = router;
```

### Report Controller

```javascript
// controllers/reportController.js
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.generateReport = async (req, res) => {
  try {
    const { reportType, dateRange, format, groupBy, detailLevel } = req.body;
    const userId = req.user.user_id;
    
    // Validate date range
    if (new Date(dateRange.end) < new Date(dateRange.start)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range. End date must be after start date.'
      });
    }
    
    // Generate report based on type
    let reportData;
    switch (reportType) {
      case 'attendance':
        reportData = await generateAttendanceReport(dateRange, groupBy);
        break;
      case 'financial':
        reportData = await generateFinancialReport(dateRange, detailLevel);
        break;
      case 'enrollment':
        reportData = await generateEnrollmentReport(dateRange);
        break;
      case 'staff':
        reportData = await generateStaffReport(dateRange);
        break;
      case 'incidents':
        reportData = await generateIncidentsReport(dateRange);
        break;
      case 'mis':
        reportData = await generateMISReport(dateRange);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }
    
    // Create report file
    const adminReportId = `ARPT-${Date.now()}`;
    const fileName = `${reportType}-report-${Date.now()}.${format}`;
    const filePath = path.join(__dirname, '../../uploads/reports', fileName);
    
    // Generate file based on format
    if (format === 'pdf') {
      await generatePDFReport(reportData, filePath);
    } else if (format === 'csv') {
      await generateCSVReport(reportData, filePath);
    } else if (format === 'excel') {
      await generateExcelReport(reportData, filePath);
    }
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(1);
    
    // Save report metadata to database
    await db.query(
      `INSERT INTO admin_reports (admin_report_id, name, type, format, file_path, file_size, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [adminReportId, `${reportType} Report`, reportType, format, fileName, fileSizeInBytes, userId]
    );
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        admin_report_id: adminReportId,
        name: `${reportType} Report`,
        type: reportType,
        format: format,
        size: `${fileSizeInMB} MB`,
        download_url: `/api/admin/reports/download/${adminReportId}`,
        created_at: new Date().toISOString(),
        generated_by: req.user.name
      }
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
};

exports.getReportHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const [reports] = await db.query(
      `SELECT 
        r.admin_report_id,
        r.name,
        r.type,
        r.format,
        CONCAT(ROUND(r.file_size / 1024 / 1024, 1), ' MB') as size,
        r.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as generated_by,
        CONCAT('/api/admin/reports/download/', r.admin_report_id) as download_url
       FROM admin_reports r
       LEFT JOIN users u ON r.user_id = u.user_id
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );
    
    res.json({
      success: true,
      message: 'Report history retrieved successfully',
      data: reports
    });
    
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report history'
    });
  }
};

exports.getQuickStats = async (req, res) => {
  try {
    const [enrollment] = await db.query(
      'SELECT COUNT(*) as count FROM children WHERE status = "active"'
    );
    
    const [attendance] = await db.query(
      `SELECT ROUND(AVG(attendance_rate), 0) as avg FROM (
        SELECT 
          DATE(check_in_time) as date,
          COUNT(*) * 100.0 / (SELECT COUNT(*) FROM children WHERE status = 'active') as attendance_rate
        FROM attendance
        WHERE MONTH(check_in_time) = MONTH(CURDATE())
          AND YEAR(check_in_time) = YEAR(CURDATE())
        GROUP BY DATE(check_in_time)
      ) as daily_attendance`
    );
    
    const [revenue] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments
       WHERE MONTH(created_at) = MONTH(CURDATE())
         AND YEAR(created_at) = YEAR(CURDATE())
         AND status = 'paid'`
    );
    
    const [staff] = await db.query(
      `SELECT COUNT(*) as count FROM users
       WHERE role IN ('teacher', 'supervisor', 'admin')
         AND status = 'active'`
    );
    
    res.json({
      success: true,
      message: 'Quick stats retrieved successfully',
      data: {
        currentEnrollment: enrollment[0].count,
        monthlyAttendanceAvg: attendance[0].avg || 0,
        revenueThisMonth: revenue[0].total,
        staffCount: staff[0].count
      }
    });
    
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick stats'
    });
  }
};
```

---

## Database Schema

### Admin Reports Table

```sql
CREATE TABLE admin_reports (
  admin_report_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  format VARCHAR(20) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create indexes separately
CREATE INDEX idx_admin_reports_type ON admin_reports(type);
CREATE INDEX idx_admin_reports_created_at ON admin_reports(created_at);
CREATE INDEX idx_admin_reports_user_id ON admin_reports(user_id);
```

---

## Testing the API

### Using cURL

**Generate Report:**
```bash
curl -X POST http://localhost:5001/api/admin/reports/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "attendance",
    "dateRange": {
      "start": "2025-09-01",
      "end": "2025-10-17"
    },
    "format": "pdf",
    "groupBy": "daily"
  }'
```

**Get Report History:**
```bash
curl -X GET "http://localhost:5001/api/admin/reports/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Quick Stats:**
```bash
curl -X GET http://localhost:5001/api/admin/reports/quick-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Required NPM Packages

```bash
npm install pdfkit exceljs fast-csv archiver
```

---

## Environment Variables

Add to `.env`:
```
REPORTS_STORAGE_PATH=./uploads/reports
MAX_REPORT_SIZE=50MB
REPORT_RETENTION_DAYS=90
```

---

## Support

For questions or issues, please contact the development team.

Last Updated: October 17, 2025
