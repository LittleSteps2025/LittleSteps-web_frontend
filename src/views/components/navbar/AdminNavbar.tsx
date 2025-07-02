import { Menu, X, User, Bell } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/users"
                className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded transition-colors"
              >
                User Management
              </Link>
              <Link
                to="/admin/subscriptions"
                className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded transition-colors"
              >
                Subscriptions
              </Link>
              <Link
                to="/admin/complaints"
                className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded transition-colors"
              >
                Complaints
              </Link>
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <div>
                  <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <User className="h-8 w-8 text-indigo-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;