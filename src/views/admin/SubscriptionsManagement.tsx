import { useState } from 'react';
import { 
 Calendar, Clock, Package, Trash2, Edit
} from 'lucide-react';

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlan, setNewPlan] = useState<{
    name: string;
    type: string;
    duration: string;
    days: string[];
    price: number;
    services: string[];
    status: string;
  }>({
    name: '',
    type: 'weekly',
    duration: 'full-day',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    price: 0,
    services: [],
    status: 'active'
  });

  // Sample subscription plans data
  const subscriptionPlans = [
    {
      id: '1',
      name: 'Week Full Day',
      type: 'weekly',
      duration: 'full-day',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      price: 12000,
      services: ['meals', 'nap', 'activities', 'extended-care'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Week Half Day',
      type: 'weekly',
      duration: 'half-day',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      price: 8000,
      services: ['meals', 'activities'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Weekend Full Day',
      type: 'weekend',
      duration: 'full-day',
      days: ['saturday', 'sunday'],
      price: 5000,
      services: ['meals', 'activities', 'premium-activities'],
      status: 'active'
    },
    {
      id: '4',
      name: 'Weekend Half Day',
      type: 'weekend',
      duration: 'half-day',
      days: ['saturday', 'sunday'],
      price: 3500,
      services: ['activities'],
      status: 'active'
    },
    {
      id: '5',
      name: 'Saturday Only',
      type: 'custom',
      duration: 'full-day',
      days: ['saturday'],
      price: 2500,
      services: ['meals', 'activities'],
      status: 'active'
    },
    {
      id: '6',
      name: 'Full Week Half Day',
      type: 'weekly',
      duration: 'half-day',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      price: 9000,
      services: ['meals', 'activities'],
      status: 'inactive'
    },
    {
      id: '7',
      name: 'Full Week Full Day',
      type: 'weekly',
      duration: 'full-day',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      price: 14000,
      services: ['meals', 'nap', 'activities', 'extended-care', 'premium-activities'],
      status: 'active'
    }
  ];

  const availableServices = [
    { id: 'meals', name: 'Meals', category: 'basic' },
    { id: 'snacks', name: 'Snacks', category: 'basic' },
    { id: 'nap', name: 'Nap Time', category: 'basic' },
    { id: 'activities', name: 'Daily Activities', category: 'basic' },
    { id: 'extended-care', name: 'Extended Care', category: 'premium' },
    { id: 'transport', name: 'Transportation', category: 'premium' },
    { id: 'premium-activities', name: 'Premium Activities', category: 'premium' },
    { id: 'weekend-care', name: 'Weekend Care', category: 'premium' },
    { id: 'all-inclusive', name: 'All Inclusive', category: 'premium' }
  ];

  const toggleService = (serviceId: string) => {
    setNewPlan(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const toggleDay = (day: string) => {
    setNewPlan(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleCreatePlan = () => {
    // Add API call to create new plan here
    console.log('Creating new plan:', newPlan);
    setShowCreateModal(false);
    // Reset form
    setNewPlan({
      name: '',
      type: 'weekly',
      duration: 'full-day',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      price: 0,
      services: [],
      status: 'active'
    });
  };

  const filteredPlans = subscriptionPlans.filter(plan => 
    activeTab === 'all' || plan.status === activeTab
  );

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#6339C0] text-white py-2 px-4 rounded-lg "
          >
            Create New Plan
          </button>
          {/* <button className="btn-secondary flex flex-wrap items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Plans
          </button> */}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'border-b-2 border-[#6339C0] text-[#6339C0]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All Plans
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'active' ? 'border-b-2 border-[#6339C0] text-[#6339C0]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'inactive' ? 'border-b-2 border-[#6339C0] text-[#6339C0]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('inactive')}
        >
          Inactive
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.status}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {plan.type}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#6339C0]">
                  LKR {plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/wk</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-[#6339C0]" />
                  <span>
                    {plan.days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-[#6339C0]" />
                  <span>
                    {plan.duration === 'full-day' ? 'Full Day (8am-6pm)' :
                     plan.duration === 'half-day' ? 'Half Day (8am-1pm)' :
                     plan.duration === 'morning' ? 'Morning (8am-12pm)' :
                     plan.duration === 'afternoon' ? 'Afternoon (1pm-6pm)' :
                     'Custom Hours'}
                  </span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <Package className="w-4 h-4 mr-2 mt-0.5 text-[#6339C0]" />
                  <div>
                    <p className="font-medium">Includes:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plan.services.map(serviceId => {
                        const service = availableServices.find(s => s.id === serviceId);
                        return service ? (
                          <span key={service.id} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {service.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap gap-2 items-center">
                <button className="btn-outline flex items-center whitespace-nowrap">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button className="btn-outline text-red-600 border-red-200 hover:bg-red-50 flex items-center whitespace-nowrap">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
            {/* Billing and subscribers section at the very bottom of the card */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {plan.type === 'annual' ? 'Annual plan' : 
                  plan.type === 'monthly' ? 'Monthly billing' : 'Weekly billing'}
              </span>
              <button className="text-sm font-medium text-[#6339C0] hover:text-[#7e57ff]">
                View Subscribers
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Subscription Plan</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="e.g., Premium Weekday Plan"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                      value={newPlan.type}
                      onChange={(e) => setNewPlan({...newPlan, type: e.target.value})}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                    >
                      <option value="full-day">Full Day</option>
                      <option value="morning">Morning Half-Day</option>
                      <option value="afternoon">Afternoon Half-Day</option>
                      <option value="custom">Custom Hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: Number(e.target.value)})}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days of Week</label>
                  <div className="flex flex-wrap gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          newPlan.days.includes(day) 
                            ? 'bg-[#6339C0] text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Included Services</label>
                  <div className="space-y-2">
                    {availableServices.map(service => (
                      <div key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={newPlan.services.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                        />
                        <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700">
                          {service.name}
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            service.category === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.category}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Status</label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                    value={newPlan.status}
                    onChange={(e) => setNewPlan({...newPlan, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  className="btn-primary"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;