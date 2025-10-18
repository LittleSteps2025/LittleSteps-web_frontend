import { API_BASE_URL } from "../config/api";

export interface DashboardStats {
  totalChildren: number;
  activeParents: number;
  activeTeachers: number;
  todayCheckIns: number;
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

// Backend API response structure
interface DashboardApiResponse {
  success: boolean;
  data: {
    overview: {
      totalChildren: number;
      activeParents: number;
      activeTeachers: number;
      activeSupervisors: number;
      todayCheckIns: number;
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
      todayCheckIns: result.data.overview.todayCheckIns,
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
      todayCheckIns: 0,
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
