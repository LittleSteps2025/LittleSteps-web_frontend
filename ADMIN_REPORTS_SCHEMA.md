# Database Schema Update - Admin Reports

## Summary of Changes

The reports table has been renamed to `admin_reports` to avoid conflicts with the existing `reports` table in the database.

---

## Updated Database Schema

### Table Name: `admin_reports`

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

## Field Changes

| Old Field Name | New Field Name | Type | Description |
|----------------|----------------|------|-------------|
| `report_id` | `admin_report_id` | VARCHAR(50) | Primary key for admin reports |

All other fields remain the same:
- `name` - Report name
- `type` - Report type (attendance, financial, enrollment, staff, incidents, mis)
- `format` - File format (pdf, csv, excel)
- `file_path` - File system path to the report file
- `file_size` - File size in bytes
- `user_id` - Foreign key to users table (who generated the report)
- `created_at` - Timestamp when report was generated

---

## ID Format Change

### Old Format:
```
RPT-20251017-001
```

### New Format:
```
ARPT-20251017-001
```

"ARPT" stands for "Admin Report" to distinguish from other report types.

---

## Updated API Response Examples

### Generate Report Response:
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

### Report History Response:
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
    }
  ]
}
```

---

## Updated SQL Queries

### Insert New Report:
```sql
INSERT INTO admin_reports (
  admin_report_id, 
  name, 
  type, 
  format, 
  file_path, 
  file_size, 
  user_id, 
  created_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, NOW());
```

### Get Report History:
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

### Get Specific Report:
```sql
SELECT * 
FROM admin_reports 
WHERE admin_report_id = ?;
```

### Delete Old Reports (Cleanup):
```sql
DELETE FROM admin_reports 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

## Backend Code Changes Required

### Route Parameter Update:
```javascript
// OLD
router.get('/download/:reportId', authenticateToken, ...);

// NEW
router.get('/download/:adminReportId', authenticateToken, ...);
```

### Controller Variable Update:
```javascript
// OLD
const { reportId } = req.params;
const reportId = `RPT-${Date.now()}`;

// NEW
const { adminReportId } = req.params;
const adminReportId = `ARPT-${Date.now()}`;
```

### Query Update:
```javascript
// OLD
await db.query('SELECT * FROM reports WHERE report_id = ?', [reportId]);

// NEW
await db.query('SELECT * FROM admin_reports WHERE admin_report_id = ?', [adminReportId]);
```

---

## Frontend Code Changes (Already Applied)

### TypeScript Interface:
```typescript
interface ReportHistory {
  admin_report_id: string;  // Changed from report_id
  name: string;
  type: string;
  format: string;
  size: string;
  created_at: string;
  download_url: string;
  generated_by?: string;
}
```

### Function Parameter:
```typescript
const handleDownloadReport = async (adminReportId: string) => {
  // Changed from reportId
  const response = await fetch(`${API_ENDPOINTS.DOWNLOAD_REPORT}/${adminReportId}`, {
    // ...
  });
};
```

### Component Rendering:
```typescript
<div key={report.admin_report_id}>
  {/* Changed from report.report_id */}
  <button onClick={() => handleDownloadReport(report.admin_report_id)}>
    Download
  </button>
</div>
```

---

## Migration Script (Optional)

If you need to migrate data from the old `reports` table to the new `admin_reports` table:

```sql
-- Create new table
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

-- Create indexes
CREATE INDEX idx_admin_reports_type ON admin_reports(type);
CREATE INDEX idx_admin_reports_created_at ON admin_reports(created_at);
CREATE INDEX idx_admin_reports_user_id ON admin_reports(user_id);

-- Migrate data (if needed, adjust ID prefix from RPT to ARPT)
INSERT INTO admin_reports (
  admin_report_id,
  name,
  type,
  format,
  file_path,
  file_size,
  user_id,
  created_at
)
SELECT 
  REPLACE(report_id, 'RPT-', 'ARPT-') as admin_report_id,
  name,
  type,
  format,
  file_path,
  file_size,
  user_id,
  created_at
FROM reports
WHERE type IN ('attendance', 'financial', 'enrollment', 'staff', 'incidents', 'mis');

-- Verify migration
SELECT COUNT(*) FROM admin_reports;

-- Optional: Keep old table for other report types or drop if not needed
-- DROP TABLE reports;
```

---

## Testing Checklist

- [ ] Create `admin_reports` table in database
- [ ] Update backend routes to use `admin_report_id`
- [ ] Update backend queries to reference `admin_reports` table
- [ ] Update ID generation to use `ARPT-` prefix
- [ ] Test report generation
- [ ] Test report history retrieval
- [ ] Test report download
- [ ] Verify foreign key constraints work correctly
- [ ] Test report cleanup/deletion queries

---

## Notes

1. **Why the change?** 
   - Avoids conflicts with existing `reports` table
   - Provides clear distinction between admin-generated reports and other report types
   - Follows naming convention for admin-specific tables

2. **Backward Compatibility:**
   - Old report URLs will not work (IDs changed from RPT to ARPT)
   - Consider keeping a redirect or migration path if needed
   - File paths remain the same, only database references changed

3. **Future Considerations:**
   - Consider adding `report_category` field to distinguish admin reports from other types
   - May want to add `expires_at` field for auto-cleanup
   - Consider adding `download_count` to track usage

---

Last Updated: October 17, 2025
