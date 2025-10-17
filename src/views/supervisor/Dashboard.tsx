import { useState, useEffect } from 'react';
import { BarChart, Download, Calendar } from 'lucide-react';
import StatsCards from '../components/stats/StatsCards';
import { fetchDashboardStats, fetchUpcomingEvents } from '../../services/dashboardService';
import type { DashboardStats, Event } from '../../services/dashboardService';
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

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
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
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
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
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <BarChart className="mr-2 text-[#4f46e5]" size={20} />
                  Weekly Overview
                </h2>
                <div className="flex space-x-2">
                  <select className="select-small" aria-label="Select time period">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                  <button className="btn-icon-small" title="Download Report">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-80 bg-gradient-to-br from-[#f0f5ff] to-[#e6eeff] rounded-xl flex items-center justify-center">
                <div className="text-center p-6">
                  <BarChart className="w-12 h-12 mx-auto text-[#4f46e5]" />
                  <p className="mt-2 text-gray-500">Supervisor analytics dashboard</p>
                  <p className="text-sm text-gray-400 mt-1">Attendance, activities, and health data visualization</p>
                </div>
              </div>
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