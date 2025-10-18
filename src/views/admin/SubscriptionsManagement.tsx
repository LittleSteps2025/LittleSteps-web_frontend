import { useState, useEffect } from 'react';
import { 
 Calendar, Clock, Package, Trash2, Edit
} from 'lucide-react';

interface SubscriptionPlan {
  plan_id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'yearly';
  duration: 'full-day' | 'half-day';
  days: string[];
  price: number;
  services: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const SubscriptionManagement = () => {
  // UI state
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Data state
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  // Fetch all subscription plans
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5001/api/subscriptions');
        if (!response.ok) throw new Error('Failed to fetch subscription plans');
        const data: ApiResponse<SubscriptionPlan[]> = await response.json();
        setSubscriptionPlans(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription plans');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionPlans();
  }, []);

  // Create new subscription plan
  const handleFormInput = (key: keyof Omit<SubscriptionPlan, 'plan_id' | 'created_at' | 'updated_at'>, value: any) => {
    setNewPlan(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreatePlan = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlan),
      });
      if (!response.ok) throw new Error('Failed to create subscription plan');
      const data: ApiResponse<SubscriptionPlan> = await response.json();
      setSubscriptionPlans(prev => [data.data, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription plan');
    } finally {
      setLoading(false);
    }
  };

  // Update subscription plan
  const handleUpdatePlan = async (planId: string, updatedPlan: Partial<SubscriptionPlan>) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5001/api/subscriptions/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlan),
      });
      if (!response.ok) throw new Error('Failed to update subscription plan');
      const data: ApiResponse<SubscriptionPlan> = await response.json();
      setSubscriptionPlans(prev => 
        prev.map(plan => plan.plan_id === planId ? data.data : plan)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription plan');
    } finally {
      setLoading(false);
    }
  };

  // Delete subscription plan
  const handleDeletePlan = async (planId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5001/api/subscriptions/${planId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete subscription plan');
      setSubscriptionPlans(prev => 
        prev.filter(plan => plan.plan_id !== planId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subscription plan');
    } finally {
      setLoading(false);
    }
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlan, setNewPlan] = useState<Omit<SubscriptionPlan, 'plan_id' | 'created_at' | 'updated_at'>>({
    name: '',
    type: 'weekly',
    duration: 'full-day',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    price: 0,
    services: [],
    status: 'active'
  });
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  const handleEditClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEditPlan(plan);
    setShowEditModal(true);
  };

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  // We'll filter the plans inline in the render


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



  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Subscription Plans
          </span>
        </h1>
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

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6339C0] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscription plans...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
          <button 
            className="float-right text-red-800 hover:text-red-900"
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionPlans
          .filter(plan => activeTab === 'all' || plan.status === activeTab)
          .map((plan: SubscriptionPlan) => (
          <div key={plan.plan_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
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
                  <span className="text-sm font-normal text-gray-500">
                    {plan.type === 'weekly' ? '/wk' : 
                     plan.type === 'monthly' ? '/mo' : 
                     '/yr'}
                  </span>
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
                <button 
                  onClick={() => handleEditClick(plan)}
                  className="btn-outline flex items-center whitespace-nowrap"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteClick(plan)}
                  className="btn-outline text-red-600 border-red-200 hover:bg-red-50 flex items-center whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
            {/* Billing and subscribers section at the very bottom of the card */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {plan.type === 'yearly' ? 'Yearly plan' : 
                  plan.type === 'monthly' ? 'Monthly billing' : 'Weekly billing'}
              </span>
              <button className="text-sm font-medium text-[#6339C0] hover:text-[#7e57ff]">
                View Subscribers
              </button>
            </div>
          </div>
        ))}
      </div>
      )}  {/* Close the loading/error wrapper */}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Subscription Plan</h2>
              <div className="text-gray-600 mb-6">
                <p>Are you sure you want to delete the subscription plan:</p>
                <p className="font-semibold text-gray-800 mt-2">"{planToDelete.name}"?</p>
                <p className="mt-4 text-sm text-red-600">
                  This action cannot be undone. All data associated with this plan will be permanently deleted.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPlanToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (planToDelete) {
                      handleDeletePlan(planToDelete.plan_id);
                      setShowDeleteModal(false);
                      setPlanToDelete(null);
                    }
                  }}
                  className="px-6 py-2 rounded-lg font-medium text-white shadow-sm
                    bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                    border border-red-600 hover:border-red-700
                    transition-all duration-200 ease-in-out
                    transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Delete Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && editPlan && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Subscription Plan</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                    value={editPlan.name}
                    onChange={(e) => setEditPlan({...editPlan, name: e.target.value})}
                    placeholder="e.g., Premium Weekday Plan"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                      value={editPlan.type}
                      onChange={(e) => setEditPlan({...editPlan, type: e.target.value as SubscriptionPlan['type']})}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                      value={editPlan.duration}
                      onChange={(e) => setEditPlan({...editPlan, duration: e.target.value as SubscriptionPlan['duration']})}
                    >
                      <option value="full-day">Full Day</option>
                      <option value="half-day">Half Day</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                    value={editPlan.price}
                    onChange={(e) => setEditPlan({...editPlan, price: Number(e.target.value)})}
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
                        onClick={() => {
                          const newDays = editPlan.days.includes(day)
                            ? editPlan.days.filter(d => d !== day)
                            : [...editPlan.days, day];
                          setEditPlan({...editPlan, days: newDays});
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          editPlan.days.includes(day) 
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
                          id={`edit-service-${service.id}`}
                          checked={editPlan.services.includes(service.id)}
                          onChange={() => {
                            const newServices = editPlan.services.includes(service.id)
                              ? editPlan.services.filter(id => id !== service.id)
                              : [...editPlan.services, service.id];
                            setEditPlan({...editPlan, services: newServices});
                          }}
                          className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                        />
                        <label htmlFor={`edit-service-${service.id}`} className="ml-2 text-sm text-gray-700">
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
                    value={editPlan.status}
                    onChange={(e) => setEditPlan({...editPlan, status: e.target.value as 'active' | 'inactive'})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditPlan(null);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editPlan && selectedPlan) {
                      handleUpdatePlan(selectedPlan.plan_id, editPlan);
                      setShowEditModal(false);
                      setEditPlan(null);
                    }
                  }}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    onChange={(e) => handleFormInput('name', e.target.value)}
                    placeholder="e.g., Premium Weekday Plan"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                      value={newPlan.type}
                      onChange={(e) => setNewPlan({...newPlan, type: e.target.value as SubscriptionPlan['type']})}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan({...newPlan, duration: e.target.value as SubscriptionPlan['duration']})}
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
                    onChange={(e) => handleFormInput('price', Number(e.target.value))}
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
                    onChange={(e) => setNewPlan({...newPlan, status: e.target.value as 'active' | 'inactive'})}
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