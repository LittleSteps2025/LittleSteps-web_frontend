import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('parent');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPrivilegedRole = ['admin', 'supervisor'].includes(role);
  const showAdminKeyField = isPrivilegedRole && (!user || user?.role !== 'admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (password !== confirm) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          ...(showAdminKeyField && { adminKey }) 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      navigate('/login', { 
        state: { 
          success: 'Account created successfully! Please login.',
          email: data.user.email 
        } 
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gradient-to-br from-[#f9f6ff] to-[#fff] p-4 mt-18">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md border-t-8 border-[#6339C0] relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-[#6339C0]">Create Your Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
              required
            />
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
              required
            />
          </div>

          {/* Role field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
              required
            >
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Show admin key field if needed */}
          {showAdminKeyField && (
            <div>
              <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Key
              </label>
              <input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
                required
              />
            </div>
          )}

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
              required
            />
          </div>

          {/* Confirm Password field */}
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6339C0] font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;