import React from 'react';

interface PlanAnalyticsProps {
  open: boolean;
  onClose: () => void;
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    churnRate: number;
    revenue: number;
  };
}

const PlanAnalytics: React.FC<PlanAnalyticsProps> = ({ open, onClose, stats }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Plan Analytics</h2>
          <div className="space-y-2">
            <div>Total Subscribers: {stats.totalSubscribers}</div>
            <div>Active Subscribers: {stats.activeSubscribers}</div>
            <div>Churn Rate: {stats.churnRate}%</div>
            <div>Revenue: ${stats.revenue}</div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="btn-outline">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanAnalytics;
