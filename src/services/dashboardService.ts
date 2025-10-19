import { API_BASE_URL } from "../config/api";

export interface DashboardStats {
  totalChildren: number;
  activeParents: number;
  activeTeachers: number;
  todayAttendance: number;
  monthlyRevenue: number;
  upcomingEvents?: number;
  pendingComplaints?: number;
  activeSupervisors?: number;
  totalComplaints?: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
}

export interface ChartData {
  revenue: Array<{
    day_name?: string;
    date_label?: string;
    parent_count: number;
    revenue: number;
  }>;
  attendance: Array<{
    day_name?: string;
    date_label?: string;
    check_ins: number;
  }>;
  complaints: Array<{
    day_name?: string;
    date_label?: string;
    complaint_count: number;
    pending_count: number;
    resolved_count: number;
  }>;
}

export interface PeriodStats {
  totalChildren: number;
  checkIns: number;
  revenue: number;
}

export interface PaymentStatus {
  paid: number;
  unpaid: number;
  overdue: number;
  total: number;
}

export interface RevenueData {
  today: number;
  monthly: number;
}

// Backend API response structure
interface DashboardApiResponse {
  success: boolean;
  data: {
    overview: {
      totalChildren: number;
      activeParents: number;
      activeTeachers: number;
      activeSupervisors: number;
      todayAttendance: number;
      monthlyRevenue: number;
      upcomingEvents: number;
      pendingComplaints: number;
      totalComplaints: number;
    };
    events: Array<{
      event_id: string;
      topic: string;
      venue: string;
      date: string;
      time: string;
      description: string;
      image?: string;
    }>;
    demographics: {
      byAgeGroup: Array<{
        age_group: string;
        count: number;
      }>;
      byGroup: Array<{
        group_name: string;
        group_id: number;
        child_count: number;
      }>;
    };
  };
  timestamp: string;
}

/**
 * Fetch all dashboard statistics from the consolidated endpoint
 * This makes a single API call to get all dashboard data
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log(
      "� Fetching dashboard statistics from:",
      `${API_BASE_URL}/dashboard/stats`
    );

    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to fetch dashboard stats: ${response.statusText}`
      );
    }

    const result: DashboardApiResponse = await response.json();

    console.log(
      "✅ Dashboard stats fetched successfully:",
      result.data.overview
    );

    const stats: DashboardStats = {
      totalChildren: result.data.overview.totalChildren,
      activeParents: result.data.overview.activeParents,
      activeTeachers: result.data.overview.activeTeachers,
      activeSupervisors: result.data.overview.activeSupervisors,
      todayAttendance: result.data.overview.todayAttendance,
      monthlyRevenue: result.data.overview.monthlyRevenue,
      upcomingEvents: result.data.overview.upcomingEvents,
      pendingComplaints: result.data.overview.pendingComplaints,
      totalComplaints: result.data.overview.totalComplaints,
    };

    return stats;
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    // Return zeros on error to prevent UI crash
    return {
      totalChildren: 0,
      activeParents: 0,
      activeTeachers: 0,
      todayAttendance: 0,
      monthlyRevenue: 0,
      upcomingEvents: 0,
      pendingComplaints: 0,
      activeSupervisors: 0,
      totalComplaints: 0,
    };
  }
};

/**
 * Fetch upcoming events from the consolidated dashboard endpoint
 */
export const fetchUpcomingEvents = async (): Promise<Event[]> => {
  try {
    console.log(
      "� Fetching upcoming events from:",
      `${API_BASE_URL}/dashboard/stats`
    );

    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const result: DashboardApiResponse = await response.json();

    const events: Event[] = result.data.events.map((event) => ({
      id: event.event_id,
      title: event.topic,
      date: event.date,
      time: event.time,
      location: event.venue,
      description: event.description,
    }));

    console.log("📅 Upcoming events fetched:", {
      count: events.length,
      events: events,
    });

    return events;
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return [];
  }
};

/**
 * Fetch stats by period (today, week, month)
 */
export const fetchStatsByPeriod = async (
  period: "today" | "week" | "month"
): Promise<PeriodStats> => {
  try {
    console.log(`📊 Fetching stats for period: ${period}`);

    const response = await fetch(
      `${API_BASE_URL}/dashboard/stats/period?period=${period}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch period stats: ${response.statusText}`);
    }

    const result = await response.json();

    console.log(`✅ Period stats (${period}) fetched:`, result.data);

    return result.data;
  } catch (error) {
    console.error("❌ Error fetching period stats:", error);
    return {
      totalChildren: 0,
      checkIns: 0,
      revenue: 0,
    };
  }
};

/**
 * Fetch chart data for graphs
 */
export const fetchChartData = async (
  period: "week" | "month"
): Promise<ChartData> => {
  try {
    console.log(`📊 Fetching chart data for period: ${period}`);

    const response = await fetch(
      `${API_BASE_URL}/dashboard/charts?period=${period}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chart data: ${response.statusText}`);
    }

    const result = await response.json();

    console.log(`✅ Chart data (${period}) fetched:`, result.data);

    return result.data;
  } catch (error) {
    console.error("❌ Error fetching chart data:", error);
    return {
      revenue: [],
      attendance: [],
      complaints: [],
    };
  }
};

/**
 * Fetch payment status (paid, unpaid, overdue)
 */
export const fetchPaymentStatus = async (): Promise<PaymentStatus> => {
  try {
    console.log(
      "💳 Fetching payment status from:",
      `${API_BASE_URL}/admin/dashboard/analytics/payments`
    );

    const response = await fetch(
      `${API_BASE_URL}/admin/dashboard/analytics/payments`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payment status: ${response.statusText}`);
    }

    const result = await response.json();

    console.log("✅ Payment status fetched:", result.data);

    return result.data || { paid: 0, unpaid: 0, overdue: 0, total: 0 };
  } catch (error) {
    console.error("❌ Error fetching payment status:", error);
    return {
      paid: 0,
      unpaid: 0,
      overdue: 0,
      total: 0,
    };
  }
};

/**
 * Fetch revenue data for today and monthly
 */
export const fetchRevenueData = async (): Promise<RevenueData> => {
  try {
    console.log(
      "💰 Fetching revenue data from:",
      `${API_BASE_URL}/dashboard/stats/period?period=today`,
      "and",
      `${API_BASE_URL}/dashboard/stats`
    );

    // Get today's revenue from the period stats endpoint
    const todayResponse = await fetch(
      `${API_BASE_URL}/dashboard/stats/period?period=today`
    );

    if (!todayResponse.ok) {
      throw new Error(
        `Failed to fetch today revenue: ${todayResponse.statusText}`
      );
    }

    const todayResult = await todayResponse.json();
    const todayRevenue = todayResult.data?.revenue || 0;

    // Get monthly revenue from the main stats endpoint
    const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`);

    if (!statsResponse.ok) {
      throw new Error(
        `Failed to fetch monthly revenue: ${statsResponse.statusText}`
      );
    }

    const statsResult = await statsResponse.json();
    const monthlyRevenue = statsResult.data?.overview?.monthlyRevenue || 0;

    console.log("✅ Revenue data fetched:", {
      today: todayRevenue,
      monthly: monthlyRevenue,
    });

    return {
      today: todayRevenue,
      monthly: monthlyRevenue,
    };
  } catch (error) {
    console.error("❌ Error fetching revenue data:", error);
    return {
      today: 0,
      monthly: 0,
    };
  }
};
