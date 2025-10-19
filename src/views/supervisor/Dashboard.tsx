import { useState, useEffect } from 'react';
import { BarChart, Download, Calendar, TrendingUp, Users, AlertCircle } from 'lucide-react';
import StatsCards from '../components/stats/StatsCards';
import { fetchDashboardStats, fetchUpcomingEvents, fetchStatsByPeriod, fetchChartData } from '../../services/dashboardService';
import type { DashboardStats, Event, PeriodStats, ChartData } from '../../services/dashboardService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SupervisorDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    activeParents: 0,
    activeTeachers: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0,
    upcomingEvents: 0,
    pendingComplaints: 0
  });
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch stats and events in parallel
        const [statsData, eventsData] = await Promise.all([
          fetchDashboardStats(),
          fetchUpcomingEvents()
        ]);
        
        setStats(statsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
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
        console.error('Error loading period stats:', error);
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
        console.error('Error loading chart data:', error);
        toast.error('Failed to load chart data');
      } finally {
        setIsLoadingCharts(false);
      }
    };

    loadChartData();
  }, [chartPeriod]);

  const formatDateTime = (dateString: string, timeString: string) => {
    // Parse date string directly without timezone conversion
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format the time (e.g., "14:30:00" -> "2:30 PM")
    const formatTime = (time: string) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const formattedTime = formatTime(timeString);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${formattedTime}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${formattedTime}`;
    } else {
      return `${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })}, ${formattedTime}`;
    }
  };

  const handlePeriodChange = (period: 'today' | 'week' | 'month') => {
    setSelectedPeriod(period);
  };

  const handleChartPeriodChange = (period: 'week' | 'month') => {
    setChartPeriod(period);
  };

  // Enhanced bar chart component with proper styling
  const SimpleBarChart = ({ 
    data, 
    labels, 
    label, 
    color 
  }: { 
    data: number[], 
    labels: string[], 
    label: string, 
    color: string 
  }) => {
    const maxValue = Math.max(...data, 1);
    // Round up to nearest nice number for y-axis max
    const yAxisMax = Math.ceil(maxValue * 1.1 / 10) * 10;
    
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 text-center mb-4">{label}</h3>
        <div className="flex-1 flex flex-col">
          {/* Chart area with y-axis */}
          <div className="relative flex items-end justify-between gap-2 h-56 px-4">
            {/* Y-axis scale */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-500 pr-2">
              <span>{yAxisMax}</span>
              <span>{Math.round(yAxisMax * 0.75)}</span>
              <span>{Math.round(yAxisMax * 0.5)}</span>
              <span>{Math.round(yAxisMax * 0.25)}</span>
              <span>0</span>
            </div>
            
            {/* Bars */}
            {data.map((value, index) => {
              const height = (value / yAxisMax) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 relative">
                  {/* Value label on top of bar */}
                  {value > 0 && (
                    <div className="text-xs font-semibold text-blue-600 mb-1">
                      {value}
                    </div>
                  )}
                  {/* Bar */}
                  <div 
                    className={`w-full ${color} rounded-t-sm transition-all hover:opacity-90 cursor-pointer shadow-sm`}
                    style={{ height: `${height}%`, minHeight: value > 0 ? '8px' : '2px' }}
                    title={`${labels[index]}: ${value}`}
                  />
                </div>
              );
            })}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between px-4 mt-2 border-t border-gray-200 pt-2">
            {labels.map((label, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-[10px] text-gray-600 font-medium">
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Supervisor Dashboard
          </span>
        </h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
              aria-label="Select date range"
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value as 'today' | 'week' | 'month')}
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
          <StatsCards stats={stats} />
          
          {/* Period Stats Display */}
          {periodStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Children ({selectedPeriod})</p>
                    <p className="text-2xl font-bold text-gray-800">{periodStats.totalChildren}</p>
                  </div>
                  <Users className="text-blue-500" size={32} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Check-ins ({selectedPeriod})</p>
                    <p className="text-2xl font-bold text-gray-800">{periodStats.checkIns}</p>
                  </div>
                  <AlertCircle className="text-green-500" size={32} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Revenue ({selectedPeriod})</p>
                    <p className="text-2xl font-bold text-gray-800">Rs. {periodStats.revenue.toLocaleString()}</p>
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
                  Weekly Overview
                </h2>
                <div className="flex space-x-2">
                  <select 
                    className="select-small" 
                    aria-label="Select time period"
                    value={chartPeriod}
                    onChange={(e) => handleChartPeriodChange(e.target.value as 'week' | 'month')}
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <button className="btn-icon-small" title="Download Report">
                    <Download className="w-4 h-4" />
                  </button>
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
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <SimpleBarChart 
                        data={chartData.revenue.map(item => item.revenue)}
                        labels={chartData.revenue.map((item, index, arr) => {
                          if (item.day_name) {
                            // For weekly: show all days abbreviated
                            return item.day_name.trim().substring(0, 3);
                          } else if (item.date_label) {
                            // For monthly: show only every 5th date or first/last
                            if (index === 0 || index === arr.length - 1 || index % 5 === 0) {
                              return item.date_label.trim().split(' ')[1]; // Show only day number
                            }
                            return '';
                          }
                          return '';
                        })}
                        label="Revenue (Rs.)"
                        color="bg-gradient-to-t from-blue-500 to-blue-400"
                      />
                    </div>
                    
                    {/* Attendance Chart */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <SimpleBarChart 
                        data={chartData.attendance.map(item => item.check_ins)}
                        labels={chartData.attendance.map((item, index, arr) => {
                          if (item.day_name) {
                            // For weekly: show all days abbreviated
                            return item.day_name.trim().substring(0, 3);
                          } else if (item.date_label) {
                            // For monthly: show only every 5th date or first/last
                            if (index === 0 || index === arr.length - 1 || index % 5 === 0) {
                              return item.date_label.trim().split(' ')[1]; // Show only day number
                            }
                            return '';
                          }
                          return '';
                        })}
                        label="Attendance (Check-ins)"
                        color="bg-gradient-to-t from-blue-500 to-blue-400"
                      />
                    </div>
                    
                    {/* Complaints Chart */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <SimpleBarChart 
                        data={chartData.complaints.map(item => item.complaint_count)}
                        labels={chartData.complaints.map((item, index, arr) => {
                          if (item.day_name) {
                            // For weekly: show all days abbreviated
                            return item.day_name.trim().substring(0, 3);
                          } else if (item.date_label) {
                            // For monthly: show only every 5th date or first/last
                            if (index === 0 || index === arr.length - 1 || index % 5 === 0) {
                              return item.date_label.trim().split(' ')[1]; // Show only day number
                            }
                            return '';
                          }
                          return '';
                        })}
                        label="Complaints"
                        color="bg-gradient-to-t from-blue-500 to-blue-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80 bg-gradient-to-br from-[#f0f5ff] to-[#e6eeff] rounded-xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <BarChart className="w-12 h-12 mx-auto text-[#4f46e5]" />
                    <p className="mt-2 text-gray-500">Loading chart data...</p>
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
              <button className="text-sm text-[#4f46e5] hover:underline">View Calendar</button>
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