import { useState, useEffect } from "react";
import { BarChart, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import StatsCards from "../components/stats/StatsCards";
import {
  fetchDashboardStats,
  fetchUpcomingEvents,
  fetchStatsByPeriod,
  fetchChartData,
  fetchPaymentStatus,
  fetchRevenueData,
} from "../../services/dashboardService";
import type {
  DashboardStats,
  Event,
  PeriodStats,
  ChartData,
  PaymentStatus,
  RevenueData,
} from "../../services/dashboardService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    activeParents: 0,
    activeTeachers: 0,
    todayAttendance: 0,
    monthlyRevenue: 0,
    upcomingEvents: 0,
    pendingComplaints: 0,
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [, setPaymentStatus] = useState<PaymentStatus>({
    paid: 0,
    unpaid: 0,
    overdue: 0,
    total: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData>({
    today: 0,
    monthly: 0,
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        console.log("Starting to load dashboard data...");

        // Fetch stats and events in parallel
        const [statsData, eventsData] = await Promise.all([
          fetchDashboardStats(),
          fetchUpcomingEvents(),
        ]);

        console.log("Dashboard data loaded:", { statsData, eventsData });
        setStats(statsData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
        // Still set default data so UI renders
        setStats({
          totalChildren: 0,
          activeParents: 0,
          activeTeachers: 0,
          todayAttendance: 0,
          monthlyRevenue: 0,
          upcomingEvents: 0,
          pendingComplaints: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Fetch period-specific stats when period changes
  useEffect(() => {
    const loadPeriodStats = async () => {
      try {
        const periodData = await fetchStatsByPeriod(selectedPeriod);
        setPeriodStats(periodData);
      } catch (error) {
        console.error("Error loading period stats:", error);
      }
    };

    loadPeriodStats();
  }, [selectedPeriod]);

  // Fetch chart data when chart period changes
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoadingCharts(true);
        const data = await fetchChartData(chartPeriod);
        setChartData(data);
      } catch (error) {
        console.error("Error loading chart data:", error);
        toast.error("Failed to load chart data");
      } finally {
        setIsLoadingCharts(false);
      }
    };

    loadChartData();
  }, [chartPeriod]);

  // Fetch payment status on component mount
  useEffect(() => {
    const loadPaymentStatus = async () => {
      try {
        const status = await fetchPaymentStatus();
        setPaymentStatus(status);
      } catch (error) {
        console.error("Error loading payment status:", error);
      }
    };

    loadPaymentStatus();
  }, []);

  // Fetch revenue data on component mount
  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        const revenue = await fetchRevenueData();
        setRevenueData(revenue);
      } catch (error) {
        console.error("Error loading revenue data:", error);
      }
    };

    loadRevenueData();
  }, []);

  const formatDateTime = (dateString: string, timeString: string) => {
    // Parse date string directly without timezone conversion
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format the time (e.g., "14:30:00" -> "2:30 PM")
    const formatTime = (time: string) => {
      if (!time) return "";
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const formattedTime = formatTime(timeString);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${formattedTime}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${formattedTime}`;
    } else {
      return `${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}, ${formattedTime}`;
    }
  };

  const handlePeriodChange = (period: "today" | "week" | "month") => {
    setSelectedPeriod(period);
  };

  const handleChartPeriodChange = (period: "week" | "month") => {
    setChartPeriod(period);
  };

  // const handleViewEventDetails = (eventId: string) => {
  //   // Navigate to events page with the specific event ID
  //   navigate('/supervisor/events', {
  //     state: { eventId, scrollToEvent: true }
  //   });
  // };

  // const handleViewCalendar = () => {
  //   navigate('/supervisor/events');
  // };

  // Enhanced bar chart component with proper styling
  const SimpleBarChart = ({
    data,
    labels,
    label,
    color,
  }: {
    data: number[];
    labels: string[];
    label: string;
    color: string;
  }) => {
    const maxValue = Math.max(...data, 1);
    // Round up to nearest nice number for y-axis max
    const yAxisMax = Math.ceil((maxValue * 1.2) / 10) * 10;

    return (
      <div className="h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 text-center mb-4">
          {label}
        </h3>
        <div className="flex-1 flex flex-col">
          {/* Chart area with y-axis */}
          <div className="relative flex items-end justify-between gap-3 h-64 px-6 pb-2">
            {/* Y-axis scale */}
            <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-500 pr-2 w-8">
              <span className="text-right w-full">{yAxisMax}</span>
              <span className="text-right w-full">
                {Math.round(yAxisMax * 0.75)}
              </span>
              <span className="text-right w-full">
                {Math.round(yAxisMax * 0.5)}
              </span>
              <span className="text-right w-full">
                {Math.round(yAxisMax * 0.25)}
              </span>
              <span className="text-right w-full">0</span>
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-8 right-0 top-0 bottom-10 pointer-events-none">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                <div
                  key={idx}
                  className="absolute w-full border-t border-gray-100"
                  style={{ bottom: `${ratio * 100}%` }}
                />
              ))}
            </div>

            {/* Bars */}
            <div className="relative flex-1 flex items-end justify-around gap-2 h-full ml-8">
              {data.map((value, index) => {
                const heightPercent =
                  yAxisMax > 0 ? (value / yAxisMax) * 100 : 0;
                const minHeight = value > 0 ? 4 : 0;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center justify-end h-full max-w-[60px]"
                  >
                    {/* Value label on top of bar */}
                    {value > 0 && (
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        {value.toLocaleString()}
                      </div>
                    )}
                    {/* Bar - using CSS custom property instead of inline style */}
                    <div
                      className={`w-full ${color} rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer shadow-md relative`}
                      style={{
                        height: `max(${heightPercent}%, ${minHeight}px)`,
                      }}
                      title={`${labels[index]}: ${value.toLocaleString()}`}
                    >
                      {/* Glossy effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-t-lg" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-around px-6 mt-3 border-t border-gray-200 pt-2 ml-8">
            {labels.map((label, index) => (
              <div key={index} className="flex-1 text-center max-w-[60px]">
                <span className="text-xs text-gray-600 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
              Supervisor Dashboard
            </span>
          </h1>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Calendar
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <select
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
                aria-label="Select date range"
                value={selectedPeriod}
                onChange={(e) =>
                  handlePeriodChange(
                    e.target.value as "today" | "week" | "month"
                  )
                }
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f46e5]"></div>
          </div>
        ) : (
          <>
            <StatsCards
              stats={{
                ...stats,
                todayCheckIns: stats.todayAttendance,
                monthlyRevenue: revenueData.monthly,
              }}
            />

            {/* Period Stats Display */}
            {periodStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Attendance ({selectedPeriod})
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {periodStats.checkIns}
                      </p>
                    </div>
                    <AlertCircle className="text-green-500" size={32} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Revenue ({selectedPeriod})
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        Rs. {periodStats.revenue.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="text-purple-500" size={32} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BarChart className="mr-2 text-[#4f46e5]" size={20} />
                    Weekly/Monthly Overview
                  </h2>
                  <div className="flex space-x-2">
                    <select
                      className="select-small"
                      aria-label="Select time period"
                      value={chartPeriod}
                      onChange={(e) =>
                        handleChartPeriodChange(
                          e.target.value as "week" | "month"
                        )
                      }
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>

                {isLoadingCharts ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5]"></div>
                  </div>
                ) : chartData ? (
                  <div className="space-y-4">
                    {/* Three charts in one row with 3 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Revenue Chart */}
                      <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-lg border border-blue-100 shadow-sm">
                        <SimpleBarChart
                          data={chartData.revenue.map((item) => item.revenue)}
                          labels={chartData.revenue.map((item, index, arr) => {
                            if (item.day_name) {
                              // For weekly: show all days abbreviated
                              return item.day_name.trim().substring(0, 3);
                            } else if (item.date_label) {
                              // For monthly: show only every 5th date or first/last
                              if (
                                index === 0 ||
                                index === arr.length - 1 ||
                                index % 5 === 0
                              ) {
                                return item.date_label.trim().split(" ")[1]; // Show only day number
                              }
                              return "";
                            }
                            return "";
                          })}
                          label="Revenue (Rs.)"
                          color="bg-gradient-to-t from-blue-600 to-blue-400"
                        />
                      </div>

                      {/* Attendance Chart */}
                      <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-lg border border-green-100 shadow-sm">
                        <SimpleBarChart
                          data={chartData.attendance.map(
                            (item) => item.check_ins
                          )}
                          labels={chartData.attendance.map(
                            (item, index, arr) => {
                              if (item.day_name) {
                                // For weekly: show all days abbreviated
                                return item.day_name.trim().substring(0, 3);
                              } else if (item.date_label) {
                                // For monthly: show only every 5th date or first/last
                                if (
                                  index === 0 ||
                                  index === arr.length - 1 ||
                                  index % 5 === 0
                                ) {
                                  return item.date_label.trim().split(" ")[1]; // Show only day number
                                }
                                return "";
                              }
                              return "";
                            }
                          )}
                          label="Attendance (Check-ins)"
                          color="bg-gradient-to-t from-green-600 to-green-400"
                        />
                      </div>

                      {/* Complaints Chart */}
                      <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-lg border border-purple-100 shadow-sm">
                        <SimpleBarChart
                          data={chartData.complaints.map(
                            (item) => item.complaint_count
                          )}
                          labels={chartData.complaints.map(
                            (item, index, arr) => {
                              if (item.day_name) {
                                // For weekly: show all days abbreviated
                                return item.day_name.trim().substring(0, 3);
                              } else if (item.date_label) {
                                // For monthly: show only every 5th date or first/last
                                if (
                                  index === 0 ||
                                  index === arr.length - 1 ||
                                  index % 5 === 0
                                ) {
                                  return item.date_label.trim().split(" ")[1]; // Show only day number
                                }
                                return "";
                              }
                              return "";
                            }
                          )}
                          label="Complaints"
                          color="bg-gradient-to-t from-purple-600 to-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 bg-gradient-to-br from-[#f0f5ff] to-[#e6eeff] rounded-xl flex items-center justify-center">
                    <div className="text-center p-6">
                      <BarChart className="w-12 h-12 mx-auto text-[#4f46e5]" />
                      <p className="mt-2 text-gray-500">
                        Loading chart data...
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Upcoming Events Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Calendar className="mr-2 text-[#4f46e5]" size={20} />
                  Upcoming Events
                </h2>
                <button className="text-sm text-[#4f46e5] hover:underline">
                  View Calendar
                </button>
              </div>
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDateTime(event.date, event.time)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {event.location}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <button className="mt-3 text-xs text-[#4f46e5] hover:underline">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No upcoming events scheduled</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Check back later for new events
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="mr-2 text-[#4f46e5]" size={20} />
                Upcoming Events
              </h2>
              <button 
                onClick={handleViewCalendar}
                className="text-sm text-[#4f46e5] hover:underline"
              >
                View All Events
              </button>
            </div>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {events.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatDateTime(event.date, event.time)}</p>
                    <p className="text-xs text-gray-500 mt-2">{event.location}</p>
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                    )}
                    <button 
                      onClick={() => handleViewEventDetails(event.id)}
                      className="mt-3 text-xs text-[#4f46e5] hover:underline font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No upcoming events scheduled</p>
                <p className="text-sm text-gray-400 mt-1">Check back later for new events</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SupervisorDashboard;
