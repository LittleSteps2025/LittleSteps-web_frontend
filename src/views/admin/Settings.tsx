import { useState } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  // Bell, 
  
  // Calendar, 
  
  // CreditCard, 
  // Shield,
  // Database,
  // Palette,
//  HelpCircle 
  
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    // Account Settings
    name: 'LittleSteps Daycare',
    email: 'nimantha@gmail.com',
    phone: '766804944',
    address: '123 Preschool Lane, Education City',
    
    // Security Settings
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: true,
    
    // Notifications
    // emailNotifications: true,
    // smsNotifications: false,
    // newEnrollmentAlerts: true,
    // paymentReminders: true,
    // incidentAlerts: true,
    
    // System Preferences
    // timezone: 'America/New_York',
    // dateFormat: 'MM/DD/YYYY',
    // timeFormat: '12h',
    // language: 'en-US',
    
    // Billing
    // plan: 'premium',
    // cardNumber: '•••• •••• •••• 4242',
    // cardExpiry: '12/25',
    // cardName: 'Admin User',
    
    // Appearance
    // theme: 'light',
    // primaryColor: '#6339C0',
    // sidebarCollapsed: false,
    // density: 'comfortable'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: <User size={18} /> },
    { id: 'security', name: 'Security', icon: <Lock size={18} /> },
    // { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    // { id: 'preferences', name: 'System Preferences', icon: <Calendar size={18} /> },
    // { id: 'billing', name: 'Billing', icon: <CreditCard size={18} /> },
    // { id: 'appearance', name: 'Appearance', icon: <Palette size={18} /> },
    // { id: 'privacy', name: 'Privacy', icon: <Shield size={18} /> },
    // { id: 'backup', name: 'Backup', icon: <Database size={18} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Settings className="mr-2" /> System Settings
        </h2>
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-purple-100 text-purple-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
        
        {/* <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="w-full flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100">
            <HelpCircle size={18} className="mr-3" />
            Help & Support
          </button>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
                  {tabs.find(t => t.id === activeTab)?.name} Settings
                </span>
              </h1>
              <p className="text-gray-500">
                Configure your daycare system {tabs.find(t => t.id === activeTab)?.name.toLowerCase()} preferences
              </p>
            </div>
            
            {(activeTab !== 'billing' && activeTab !== 'backup') && (
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-[#6339C0] text-white py-2 px-6 rounded-lg hover:bg-[#5227a3] transition-colors font-medium flex items-center disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
              Settings saved successfully!
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Organization Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daycare Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
              
              {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Features</h3>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="twoFactorAuth"
                      checked={formData.twoFactorAuth}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div> */}
            </div>
          )}

          {/* Notification Settings */}
          {/* {activeTab === 'notifications' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-800">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive important updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-800">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive urgent alerts via text message</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="space-y-4 mt-6">
                <h4 className="font-medium text-gray-800">Notification Types</h4>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h5 className="text-gray-700">New Enrollment Alerts</h5>
                    <p className="text-sm text-gray-500">When a new child is registered</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="newEnrollmentAlerts"
                      checked={formData.newEnrollmentAlerts}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h5 className="text-gray-700">Payment Reminders</h5>
                    <p className="text-sm text-gray-500">When payments are due or received</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="paymentReminders"
                      checked={formData.paymentReminders}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h5 className="text-gray-700">Incident Alerts</h5>
                    <p className="text-sm text-gray-500">When incidents are reported</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="incidentAlerts"
                      checked={formData.incidentAlerts}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )} */}

          {/* System Preferences */}
          {/* {activeTab === 'preferences' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select
                    name="dateFormat"
                    value={formData.dateFormat}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                  <select
                    name="timeFormat"
                    value={formData.timeFormat}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="12h">12-hour clock</option>
                    <option value="24h">24-hour clock</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                  </select>
                </div>
              </div>
            </div>
          )} */}

          {/* Billing Settings */}
          {/* {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Plan</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Current Plan</h4>
                    <p className="text-sm text-gray-500">
                      {formData.plan === 'premium' 
                        ? 'Premium Plan - $99/month' 
                        : 'Basic Plan - $49/month'}
                    </p>
                  </div>
                  <button className="btn-secondary border-purple-200 text-purple-700 hover:bg-purple-50">
                    Change Plan
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">Visa ending in 4242</h4>
                      <p className="text-sm text-gray-500">Expires {formData.cardExpiry}</p>
                    </div>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
                
                <button className="btn-secondary border-purple-200 text-purple-700 hover:bg-purple-50">
                  + Add Payment Method
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing History</h3>
                
                <div className="space-y-3">
                  {[
                    { id: 'inv-789', date: 'Nov 15, 2023', amount: '$99.00', status: 'Paid' },
                    { id: 'inv-788', date: 'Oct 15, 2023', amount: '$99.00', status: 'Paid' },
                    { id: 'inv-787', date: 'Sep 15, 2023', amount: '$99.00', status: 'Paid' }
                  ].map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border-b border-gray-100">
                      <div>
                        <h4 className="font-medium text-gray-800">Invoice #{invoice.id}</h4>
                        <p className="text-sm text-gray-500">{invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="mt-4 text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View Full History
                </button>
              </div>
            </div>
          )} */}

          {/* Appearance Settings */}
          {/* {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme</h3>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFormData({...formData, theme: 'light'})}
                    className={`p-4 rounded-lg border-2 ${formData.theme === 'light' ? 'border-purple-500' : 'border-gray-200'}`}
                  >
                    <div className="w-32 h-20 bg-white rounded-md shadow-inner border border-gray-200"></div>
                    <p className="mt-2 text-center font-medium">Light</p>
                  </button>
                  
                  <button
                    onClick={() => setFormData({...formData, theme: 'dark'})}
                    className={`p-4 rounded-lg border-2 ${formData.theme === 'dark' ? 'border-purple-500' : 'border-gray-200'}`}
                  >
                    <div className="w-32 h-20 bg-gray-800 rounded-md shadow-inner border border-gray-700"></div>
                    <p className="mt-2 text-center font-medium">Dark</p>
                  </button>
                  
                  <button
                    onClick={() => setFormData({...formData, theme: 'system'})}
                    className={`p-4 rounded-lg border-2 ${formData.theme === 'system' ? 'border-purple-500' : 'border-gray-200'}`}
                  >
                    <div className="w-32 h-20 bg-gradient-to-r from-white to-gray-800 rounded-md shadow-inner border border-gray-200"></div>
                    <p className="mt-2 text-center font-medium">System</p>
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Color Scheme</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-10 h-10 rounded-full cursor-pointer border-2 border-white shadow"
                      style={{ backgroundColor: formData.primaryColor }}
                      onClick={() => document.getElementById('colorPicker').click()}
                    ></div>
                    <input
                      type="color"
                      id="colorPicker"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm text-gray-600">{formData.primaryColor}</span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {['#6339C0', '#4F46E5', '#2563EB', '#059669', '#D97706'].map(color => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow"
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({...formData, primaryColor: color})}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Layout</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Collapsed Sidebar</h4>
                      <p className="text-sm text-gray-500">Minimize the sidebar navigation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="sidebarCollapsed"
                        checked={formData.sidebarCollapsed}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Density</label>
                    <div className="flex space-x-2">
                      {['compact', 'comfortable', 'spacious'].map(density => (
                        <button
                          key={density}
                          onClick={() => setFormData({...formData, density})}
                          className={`px-3 py-1.5 text-sm rounded-md ${
                            formData.density === density
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {density.charAt(0).toUpperCase() + density.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Privacy Settings */}
          {/* {activeTab === 'privacy' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy Settings</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">Data Collection</h4>
                  <p className="text-sm text-blue-700">
                    We collect minimal usage data to improve our services. This data is anonymized and never shared with third parties.
                  </p>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-800">Analytics Tracking</h4>
                    <p className="text-sm text-gray-500">Help us improve by sharing usage data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-800">Show Organization in Public Directory</h4>
                    <p className="text-sm text-gray-500">Allow parents to find your daycare in searches</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium text-gray-800 mb-2">Data Requests</h4>
                <div className="flex space-x-3">
                  <button className="btn-secondary border-purple-200 text-purple-700 hover:bg-purple-50">
                    Request Data Export
                  </button>
                  <button className="btn-secondary border-red-200 text-red-700 hover:bg-red-50">
                    Request Account Deletion
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* Backup Settings */}
          {/* {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Backup</h3>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 mb-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Last Backup</h4>
                  <p className="text-sm text-yellow-700">
                    November 28, 2023 at 2:30 AM (automated)
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-[#6339C0] text-white py-2 px-4 rounded-lg hover:bg-[#5227a3] transition-colors flex items-center justify-center">
                    <Database className="w-4 h-4 mr-2" />
                    Create Backup Now
                  </button>
                  <button className="bg-[#6339C0] text-white py-2 px-4 rounded-lg hover:bg-[#5227a3] transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Latest Backup
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Backup Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h4 className="font-medium text-gray-800">Automatic Backups</h4>
                      <p className="text-sm text-gray-500">Daily backups at 2:00 AM</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => {}}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Backup Retention</label>
                    <select className="input-field">
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Backup Storage</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Local Server</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <p className="text-xs text-gray-500">/var/backups/littlesteps</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Restore Data</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <h4 className="font-medium text-red-800 mb-2">Warning</h4>
                    <p className="text-sm text-red-700">
                      Restoring from a backup will overwrite all current data. This action cannot be undone.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Backup File</label>
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer">
                        <div className="px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload backup file</p>
                            <p className="text-xs text-gray-500 mt-1">.zip or .sql files</p>
                          </div>
                          <input type="file" className="sr-only" accept=".zip,.sql" />
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <button className="btn-secondary border-red-200 text-red-700 hover:bg-red-50 w-full">
                    Restore from Backup
                  </button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;