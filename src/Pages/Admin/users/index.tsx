import { BarChart, PieChart } from 'lucide-react';


const Dashboard = () => {
  // Sample data - replace with real data from your API
  const stats = {
    totalChildren: 245,
    activeParents: 180,
    activeTeachers: 25,
    activeSupervisors: 8,
    todayCheckIns: 120,
    pendingComplaints: 5,
    monthlyRevenue: 12500
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
     
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Monthly Check-ins</h2>
            <BarChart className="text-[#6339C0]" />
          </div>
          {/* Chart component would go here */}
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Attendance Chart</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">User Distribution</h2>
            <PieChart className="text-[#6339C0]" />
          </div>
          {/* Pie chart component would go here */}
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">User Distribution Chart</p>
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default Dashboard;