import { useState, useEffect } from 'react';
import { BarChart, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../components/stats/StatsCards';
import RecentActivity from '../components/activity/RecentActivity';
import QuickActions from '../components/actions/QuickActions';

interface DashboardStats {
  totalChildren: number;
  activeParents: number;
  activeTeachers: number;
  activeSupervisors: number;
  todayCheckIns: number;
  monthlyRevenue: number;
}

interface AttendanceTrend {
  date: string;
  checkIns: number;
  checkOuts: number;
}

interface RevenueTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface EnrollmentData {
  month: string;
  enrolled: number;
  withdrawn: number;
  active: number;
}

interface PaymentStatus {
  paid: number;
  unpaid: number;
  overdue: number;
  total: number;
}

interface ComplaintStats {
  pending: number;
  resolved: number;
  inProgress: number;
  total: number;
}

interface SubscriptionBreakdown {
  planName: string;
  count: number;
  revenue: number;
}

interface StaffPerformance {
  staffName: string;
  role: string;
  activitiesCount: number;
  rating: number;
}

interface AnalyticsData {
  attendanceTrends: AttendanceTrend[];
  revenueTrends: RevenueTrend[];
  enrollmentData: EnrollmentData[];
  paymentStatus: PaymentStatus;
  complaintStats: ComplaintStats;
  subscriptionBreakdown: SubscriptionBreakdown[];
  staffPerformance: StaffPerformance[];
  peakHours: { hour: string; count: number }[];
}

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  type?: string;
  user_id?: string;
  timestamp?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_ENDPOINTS = {
  DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
  RECENT_ACTIVITIES: `${API_BASE_URL}/admin/dashboard/activities`,
  ANALYTICS: `${API_BASE_URL}/admin/dashboard/analytics`,
} as const;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    activeParents: 0,
    activeTeachers: 0,
    activeSupervisors: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [refreshing, setRefreshing] = useState(false);

  // Analytics data states
  const [, setAttendanceTrends] = useState<AttendanceTrend[]>([]);
  const [, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [, setPaymentStatus] = useState<PaymentStatus>({ paid: 0, unpaid: 0, overdue: 0, total: 0 });
  const [, setComplaintStats] = useState<ComplaintStats>({ pending: 0, resolved: 0, inProgress: 0, total: 0 });
  const [, setSubscriptionBreakdown] = useState<SubscriptionBreakdown[]>([]);
  const [, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [, setPeakHours] = useState<{ hour: string; count: number }[]>([]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ANALYTICS}?period=${selectedPeriod}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data: ApiResponse<AnalyticsData> = await response.json();
      
      if (data.success && data.data) {
        setAttendanceTrends(data.data.attendanceTrends || []);
        setRevenueTrends(data.data.revenueTrends || []);
        setEnrollmentData(data.data.enrollmentData || []);
        setPaymentStatus(data.data.paymentStatus || { paid: 0, unpaid: 0, overdue: 0, total: 0 });
        setComplaintStats(data.data.complaintStats || { pending: 0, resolved: 0, inProgress: 0, total: 0 });
        setSubscriptionBreakdown(data.data.subscriptionBreakdown || []);
        setStaffPerformance(data.data.staffPerformance || []);
        setPeakHours(data.data.peakHours || []);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Don't show error for analytics, just log it
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data: ApiResponse<DashboardStats> = await response.json();
      
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RECENT_ACTIVITIES}?limit=10`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }

      const data: ApiResponse<Activity[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Transform activities to include formatted time
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedActivities = data.data.map((activity: any) => ({
          id: activity.id || activity.activity_id,
          user: activity.user || activity.user_name,
          action: activity.action || activity.activity_type,
          time: activity.timestamp ? formatTimeAgo(activity.timestamp) : activity.time,
          type: activity.type,
          user_id: activity.user_id,
          timestamp: activity.timestamp
        }));
        setRecentActivities(formattedActivities);
      } else {
        throw new Error(data.message || 'Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      // Don't set error for activities, just log it
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentActivities(),
      fetchAnalytics()
    ]);
    setLoading(false);
  };

  // Refresh dashboard data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Reload analytics with new period
    fetchAnalytics();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Dashboard Overview
          </span>
        </h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-[#6339C0] text-white py-2 px-4 rounded-lg hover:bg-[#5227a3] transition-colors flex items-center disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          <StatsCards stats={stats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Monthly Check-ins</h2>
                <div className="flex space-x-2">
                  <select 
                    className="select-small" 
                    aria-label="Select time period"
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                  >
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="this-year">This Year</option>
                  </select>
                  <button className="btn-icon-small" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-80 bg-gradient-to-br from-[#f9f6ff] to-[#f0e9ff] rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="w-12 h-12 mx-auto text-[#6339C0]" />
                  <p className="mt-2 text-gray-500">Attendance analytics chart</p>
                  <p className="mt-1 text-xs text-gray-400">Chart integration coming soon</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
                </div>
                <QuickActions />
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                  <button 
                    onClick={() => navigate('/admin/activities')}
                    className="text-sm text-[#6339C0] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <RecentActivity activities={recentActivities} />
                {recentActivities.length === 0 && !loading && (
                  <p className="text-center text-gray-500 text-sm py-4">No recent activities</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;