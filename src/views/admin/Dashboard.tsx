import { useState, useEffect } from 'react';
import { BarChart, Download, RefreshCw, TrendingUp, Calendar, Users, DollarSign, AlertCircle } from 'lucide-react';
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
  DASHBOARD_STATS: `${API_BASE_URL}/api/admin/dashboard/stats`,
  RECENT_ACTIVITIES: `${API_BASE_URL}/api/admin/dashboard/activities`,
  ANALYTICS: `${API_BASE_URL}/api/admin/dashboard/analytics`,
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
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrend[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ paid: 0, unpaid: 0, overdue: 0, total: 0 });
  
  // Helper to get last 7 days with data or placeholders
  const getWeeklyAttendanceData = (): AttendanceTrend[] => {
    if (attendanceTrends.length >= 7) {
      return attendanceTrends.slice(0, 7);
    }
    
    // Generate last 7 days
    const today = new Date();
    const weekData: AttendanceTrend[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Check if we have real data for this date
      const existingData = attendanceTrends.find(t => 
        new Date(t.date).toDateString() === date.toDateString()
      );
      
      if (existingData) {
        weekData.push(existingData);
      } else {
        // Add placeholder with zero values
        weekData.push({
          date: dateStr,
          checkIns: 0,
          checkOuts: 0
        });
      }
    }
    
    return weekData;
  };
  // Unused but kept for future features
  // const [complaintStats, setComplaintStats] = useState<ComplaintStats>({ pending: 0, resolved: 0, inProgress: 0, total: 0 });
  // const [subscriptionBreakdown, setSubscriptionBreakdown] = useState<SubscriptionBreakdown[]>([]);
  // const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  // const [peakHours, setPeakHours] = useState<{ hour: string; count: number }[]>([]);

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
        console.warn('Analytics endpoint not available, using empty data');
        return;
      }

      const data: ApiResponse<AnalyticsData> = await response.json();
      
      if (data.success && data.data) {
        setAttendanceTrends(data.data.attendanceTrends || []);
        setRevenueTrends(data.data.revenueTrends || []);
        setEnrollmentData(data.data.enrollmentData || []);
        setPaymentStatus(data.data.paymentStatus || { paid: 0, unpaid: 0, overdue: 0, total: 0 });
        // Future features: complaints, subscriptions, staff performance, peak hours
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Reset to empty arrays on error to prevent rendering issues
      setAttendanceTrends([]);
      setRevenueTrends([]);
      setEnrollmentData([]);
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
        console.warn('Dashboard stats endpoint not available, using default values');
        return;
      }

      const data: ApiResponse<DashboardStats> = await response.json();
      
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      // Don't set error, just log it and continue with default values
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
        console.warn('Activities endpoint not available');
        return;
      }

      const data: ApiResponse<Activity[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Transform activities to include formatted time
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
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivities(),
        fetchAnalytics()
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      // Don't block the UI, just log the error
    } finally {
      setLoading(false);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Weekly Attendance Pattern
                </h2>
                <div className="flex space-x-2">
                  <select 
                    className="select-small" 
                    aria-label="Select time period"
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                  >
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                  </select>
                  <button 
                    onClick={() => navigate('/admin/attendance')}
                    className="btn-icon-small" 
                    title="View Full Attendance"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              
              <div className="h-80">
                {/* Heatmap Chart */}
                <div className="space-y-4">
                  {/* Week Days Header */}
                  <div className="grid grid-cols-8 gap-2 text-center text-xs font-medium text-gray-600">
                    <div></div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  {/* Heatmap Rows - Morning */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-8 gap-2 items-center">
                      <div className="text-xs font-medium text-gray-600 text-right pr-2">Morning</div>
                      {getWeeklyAttendanceData().map((trend, idx) => {
                        const intensity = trend.checkIns > 0 ? Math.min((trend.checkIns / 50) * 100, 100) : 0;
                        const bgColor = intensity > 75 ? 'bg-green-600' : 
                                       intensity > 50 ? 'bg-green-500' : 
                                       intensity > 25 ? 'bg-green-400' : 
                                       intensity > 0 ? 'bg-green-200' : 'bg-gray-100';
                        
                        return (
                          <div
                            key={idx}
                            className={`${bgColor} h-16 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group relative`}
                            title={`${trend.date}: ${trend.checkIns} check-ins`}
                          >
                            <span className={`text-sm font-bold ${intensity > 0 ? 'text-white' : 'text-gray-400'} drop-shadow`}>
                              {trend.checkIns}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {trend.date}: {trend.checkIns} kids
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Afternoon */}
                    <div className="grid grid-cols-8 gap-2 items-center">
                      <div className="text-xs font-medium text-gray-600 text-right pr-2">Afternoon</div>
                      {getWeeklyAttendanceData().map((trend, idx) => {
                        const intensity = trend.checkOuts > 0 ? Math.min((trend.checkOuts / 50) * 100, 100) : 0;
                        const bgColor = intensity > 75 ? 'bg-orange-600' : 
                                       intensity > 50 ? 'bg-orange-500' : 
                                       intensity > 25 ? 'bg-orange-400' : 
                                       intensity > 0 ? 'bg-orange-200' : 'bg-gray-100';
                        
                        return (
                          <div
                            key={idx}
                            className={`${bgColor} h-16 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group relative`}
                            title={`${trend.date}: ${trend.checkOuts} check-outs`}
                          >
                            <span className={`text-sm font-bold ${intensity > 0 ? 'text-white' : 'text-gray-400'} drop-shadow`}>
                              {trend.checkOuts}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {trend.date}: {trend.checkOuts} kids
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Daily Total */}
                    <div className="grid grid-cols-8 gap-2 items-center pt-2 border-t border-gray-100">
                      <div className="text-xs font-medium text-gray-600 text-right pr-2">Total</div>
                      {getWeeklyAttendanceData().map((trend, idx) => {
                        const total = trend.checkIns;
                        const intensity = total > 0 ? Math.min((total / 50) * 100, 100) : 0;
                        const bgColor = intensity > 75 ? 'bg-purple-600' : 
                                       intensity > 50 ? 'bg-purple-500' : 
                                       intensity > 25 ? 'bg-purple-400' : 
                                       intensity > 0 ? 'bg-purple-200' : 'bg-gray-100';
                        
                        return (
                          <div
                            key={idx}
                            className={`${bgColor} h-12 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group relative`}
                          >
                            <span className={`text-sm font-bold ${intensity > 0 ? 'text-white' : 'text-gray-400'} drop-shadow`}>
                              {total}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {trend.date}: {total} total
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                        <span className="text-gray-600">Check-ins</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-600 rounded mr-2"></div>
                        <span className="text-gray-600">Check-outs</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
                        <span className="text-gray-600">Daily Total</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>Less</span>
                      <div className="w-4 h-4 bg-gray-100 rounded"></div>
                      <div className="w-4 h-4 bg-green-200 rounded"></div>
                      <div className="w-4 h-4 bg-green-400 rounded"></div>
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span>More</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Avg Check-ins</p>
                      <p className="text-xl font-bold text-green-600">
                        {getWeeklyAttendanceData().length > 0
                          ? Math.round(getWeeklyAttendanceData().reduce((sum, t) => sum + t.checkIns, 0) / getWeeklyAttendanceData().length)
                          : 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Avg Check-outs</p>
                      <p className="text-xl font-bold text-orange-600">
                        {getWeeklyAttendanceData().length > 0
                          ? Math.round(getWeeklyAttendanceData().reduce((sum, t) => sum + t.checkOuts, 0) / getWeeklyAttendanceData().length)
                          : 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Best Day</p>
                      <p className="text-sm font-bold text-purple-600">
                        {getWeeklyAttendanceData().length > 0 && getWeeklyAttendanceData().some(t => t.checkIns > 0)
                          ? getWeeklyAttendanceData().reduce((max, t) => t.checkIns > max.checkIns ? t : max, getWeeklyAttendanceData()[0])?.date
                          : '-'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Total Week</p>
                      <p className="text-xl font-bold text-blue-600">
                        {getWeeklyAttendanceData().reduce((sum, t) => sum + t.checkIns, 0)}
                      </p>
                    </div>
                  </div>
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

          {/* Simple Analytics for Decision Making */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Attendance Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Attendance Overview
                </h2>
                <button 
                  onClick={() => navigate('/admin/attendance')}
                  className="text-xs text-purple-600 hover:underline"
                >
                  View Details
                </button>
              </div>
              <div className="space-y-4">
                {/* Today's Attendance */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Check-ins</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {stats.todayCheckIns || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-500 opacity-70" />
                  </div>
                </div>

                {/* This Week Trend - Bar Chart */}
                {attendanceTrends.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">This Week's Trend</p>
                    <div className="space-y-3 mt-3">
                      {attendanceTrends.slice(0, 7).map((trend, idx) => {
                        const maxValue = Math.max(...attendanceTrends.map(t => Math.max(t.checkIns, t.checkOuts)));
                        const checkInWidth = (trend.checkIns / maxValue) * 100;
                        const checkOutWidth = (trend.checkOuts / maxValue) * 100;
                        
                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600 font-medium w-16">{trend.date}</span>
                              <div className="flex items-center space-x-3 text-xs">
                                <span className="text-green-600">{trend.checkIns}</span>
                                <span className="text-orange-600">{trend.checkOuts}</span>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${checkInWidth}%` }}
                                ></div>
                              </div>
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${checkOutWidth}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 mr-1"></div>
                        <span className="text-gray-600">Check-ins</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 mr-1"></div>
                        <span className="text-gray-600">Check-outs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">No attendance data available</p>
                  </div>
                )}

                {/* Quick Insight */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    💡 Tip: Monitor daily check-ins to identify attendance patterns
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Payment Status
                </h2>
                <button 
                  onClick={() => navigate('/admin/payments')}
                  className="text-xs text-green-600 hover:underline"
                >
                  Manage Payments
                </button>
              </div>
              <div className="space-y-4">
                {/* Revenue This Month */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Month's Revenue</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {new Intl.NumberFormat('en-LK', { 
                          style: 'currency', 
                          currency: 'LKR',
                          minimumFractionDigits: 0 
                        }).format(stats.monthlyRevenue || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-blue-500 opacity-70" />
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-2xl font-bold text-green-600">{paymentStatus.paid}</p>
                    <p className="text-xs text-gray-600 mt-1">Paid</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-2xl font-bold text-yellow-600">{paymentStatus.unpaid}</p>
                    <p className="text-xs text-gray-600 mt-1">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-2xl font-bold text-red-600">{paymentStatus.overdue}</p>
                    <p className="text-xs text-gray-600 mt-1">Overdue</p>
                  </div>
                </div>

                {/* Quick Action for Overdue */}
                {paymentStatus.overdue > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Action Required</p>
                      <p className="text-xs text-red-600 mt-1">
                        {paymentStatus.overdue} payment{paymentStatus.overdue > 1 ? 's' : ''} overdue. 
                        Follow up with parents.
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Insight */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    💡 Tip: Follow up on overdue payments to maintain cash flow
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Children & Enrollment Simple Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                  Revenue Trend (Last 6 Months)
                </h3>
                <button 
                  onClick={() => navigate('/admin/payments')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Reports
                </button>
              </div>
              {revenueTrends.length > 0 ? (
                <div className="h-48">
                  <div className="flex items-end justify-between h-full space-x-2">
                    {revenueTrends.slice(-6).map((trend, idx) => {
                      const maxRevenue = Math.max(...revenueTrends.map(t => t.revenue));
                      const height = (trend.revenue / maxRevenue) * 100;
                      const isProfit = trend.profit > 0;
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="relative flex-1 w-full flex items-end">
                            <div className="w-full flex flex-col items-center space-y-1">
                              {/* Revenue Bar */}
                              <div 
                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer relative group"
                                style={{ height: `${height}%`, minHeight: '20px' }}
                                title={`Revenue: ${new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', notation: 'compact' }).format(trend.revenue)}`}
                              >
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                  {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', notation: 'compact' }).format(trend.revenue)}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Month Label */}
                          <div className="mt-2 text-center">
                            <p className="text-xs font-medium text-gray-600">{trend.month}</p>
                            <p className={`text-xs font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                              {isProfit ? '+' : ''}{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', notation: 'compact' }).format(trend.profit)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded bg-blue-500 mr-1"></div>
                      <span className="text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded bg-green-600 mr-1"></div>
                      <span className="text-gray-600">Profit</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded bg-red-600 mr-1"></div>
                      <span className="text-gray-600">Loss</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">No revenue data available</p>
                    <p className="text-xs text-gray-400 mt-1">Data will appear once payments are recorded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Distribution Donut Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Payment Distribution</h3>
              </div>
              {paymentStatus.total > 0 ? (
                <div className="space-y-4">
                  {/* Semi-circular gauge */}
                  <div className="relative h-32 flex items-end justify-center">
                    <div className="relative w-48 h-24 overflow-hidden">
                      {/* Background semicircle */}
                      <div className="absolute bottom-0 w-full h-full">
                        <div className="absolute bottom-0 left-0 w-full h-full border-[20px] border-gray-200 rounded-t-full"></div>
                        
                        {/* Paid section (green) */}
                        <div 
                          className="absolute bottom-0 left-0 w-full h-full border-[20px] border-green-500 rounded-t-full transition-all duration-700"
                          style={{ 
                            clipPath: `polygon(0 100%, 0 0, ${(paymentStatus.paid / paymentStatus.total) * 100}% 0, ${(paymentStatus.paid / paymentStatus.total) * 100}% 100%)`,
                          }}
                        ></div>
                        
                        {/* Unpaid section (yellow) */}
                        <div 
                          className="absolute bottom-0 left-0 w-full h-full border-[20px] border-yellow-500 rounded-t-full transition-all duration-700"
                          style={{ 
                            clipPath: `polygon(${(paymentStatus.paid / paymentStatus.total) * 100}% 100%, ${(paymentStatus.paid / paymentStatus.total) * 100}% 0, ${((paymentStatus.paid + paymentStatus.unpaid) / paymentStatus.total) * 100}% 0, ${((paymentStatus.paid + paymentStatus.unpaid) / paymentStatus.total) * 100}% 100%)`,
                          }}
                        ></div>
                        
                        {/* Overdue section (red) */}
                        <div 
                          className="absolute bottom-0 left-0 w-full h-full border-[20px] border-red-500 rounded-t-full transition-all duration-700"
                          style={{ 
                            clipPath: `polygon(${((paymentStatus.paid + paymentStatus.unpaid) / paymentStatus.total) * 100}% 100%, ${((paymentStatus.paid + paymentStatus.unpaid) / paymentStatus.total) * 100}% 0, 100% 0, 100% 100%)`,
                          }}
                        ></div>
                      </div>
                      
                      {/* Center text */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center mb-2">
                        <p className="text-2xl font-bold text-gray-800">{paymentStatus.total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-700">Paid</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {paymentStatus.paid} ({Math.round((paymentStatus.paid / paymentStatus.total) * 100)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-700">Pending</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-600">
                        {paymentStatus.unpaid} ({Math.round((paymentStatus.unpaid / paymentStatus.total) * 100)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm text-gray-700">Overdue</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {paymentStatus.overdue} ({Math.round((paymentStatus.overdue / paymentStatus.total) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">No payment data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Staff & Enrollment Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Enrollment Trend Line Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-600" />
                  Enrollment Trend
                </h3>
                <button 
                  onClick={() => navigate('/admin/children')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  View Children
                </button>
              </div>
              {enrollmentData.length > 0 ? (
                <div className="space-y-4">
                  {/* Line Chart */}
                  <div className="relative h-40 bg-gradient-to-b from-indigo-50 to-white rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="300" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="75" x2="300" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />
                      
                      {/* Active children line */}
                      {(() => {
                        const maxActive = Math.max(...enrollmentData.map(d => d.active));
                        const points = enrollmentData.slice(-6).map((data, idx) => {
                          const x = (idx / (enrollmentData.slice(-6).length - 1)) * 300;
                          const y = 100 - ((data.active / maxActive) * 90);
                          return `${x},${y}`;
                        }).join(' ');
                        
                        return (
                          <>
                            {/* Area fill */}
                            <polygon 
                              points={`0,100 ${points} 300,100`} 
                              fill="url(#gradient)" 
                              opacity="0.3"
                            />
                            {/* Line */}
                            <polyline 
                              points={points} 
                              fill="none" 
                              stroke="#6366f1" 
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Dots */}
                            {enrollmentData.slice(-6).map((data, idx) => {
                              const x = (idx / (enrollmentData.slice(-6).length - 1)) * 300;
                              const y = 100 - ((data.active / maxActive) * 90);
                              return (
                                <g key={idx}>
                                  <circle cx={x} cy={y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Month labels and stats */}
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {enrollmentData.slice(-6).map((data, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="font-medium text-gray-700">{data.month}</p>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-indigo-600 font-bold">{data.active}</p>
                          <div className="flex items-center justify-center space-x-1 text-[10px]">
                            <span className="text-green-600">+{data.enrolled}</span>
                            <span className="text-red-600">-{data.withdrawn}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="flex items-center justify-around pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Current</p>
                      <p className="text-lg font-bold text-indigo-600">{stats.totalChildren || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">This Month</p>
                      <p className="text-lg font-bold text-green-600">
                        +{enrollmentData[enrollmentData.length - 1]?.enrolled || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Withdrawn</p>
                      <p className="text-lg font-bold text-red-600">
                        -{enrollmentData[enrollmentData.length - 1]?.withdrawn || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">No enrollment data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Children Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-800 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-600" />
                  Quick Stats
                </h3>
              </div>
              <div className="space-y-4">
                {/* Total Children - Big Number */}
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Children</p>
                  <p className="text-5xl font-bold text-indigo-600">{stats.totalChildren || 0}</p>
                </div>

                {/* Staff Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mr-2"></div>
                      <span className="text-sm text-gray-700">Teachers</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600">{stats.activeTeachers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-700">Supervisors</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{stats.activeSupervisors || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-pink-500 mr-2"></div>
                      <span className="text-sm text-gray-700">Parents</span>
                    </div>
                    <span className="text-lg font-bold text-pink-600">{stats.activeParents || 0}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <button 
                    onClick={() => navigate('/admin/children')}
                    className="w-full text-sm text-indigo-600 hover:bg-indigo-50 py-2 rounded transition-colors"
                  >
                    Manage Children →
                  </button>
                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="w-full text-sm text-teal-600 hover:bg-teal-50 py-2 rounded transition-colors"
                  >
                    Manage Staff →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;