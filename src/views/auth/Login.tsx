import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Try admin login first
      let response;
      try {
        response = await fakeAdminLogin({ email, password });
      } catch {
        // If admin login fails, try supervisor login
        response = await fakeSupervisorLogin({ email, password });
      }
      
      // Type assertion for response
      const typedResponse = response as {
        user: { id: string; name: string; email: string; role: 'admin' | 'supervisor' };
        token: string;
      };

      // Login the user
      login(typedResponse.user, typedResponse.token);
      
      // Redirect based on role
      if (typedResponse.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (typedResponse.user.role === 'supervisor') {
        navigate('/supervisor', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
      
    } catch {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  // Mock admin login function
  const fakeAdminLogin = async (credentials: { email: string; password: string }) => {
    const adminCredentials = {
      email: 'admin@example.com',
      password: 'admin123'
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          credentials.email === adminCredentials.email &&
          credentials.password === adminCredentials.password
        ) {
          resolve({
            user: {
              id: '1',
              name: 'Admin User',
              email: credentials.email,
              role: "admin" as const
            },
            token: 'fake-admin-token'
          });
        } else {
          reject(new Error('Invalid admin credentials'));
        }
      }, 1000);
    });
  };

  // Mock supervisor login function
  const fakeSupervisorLogin = async (credentials: { email: string; password: string }) => {
    const supervisorCredentials = {
      email: 'supervisor@example.com',
      password: 'supervisor123'
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          credentials.email === supervisorCredentials.email &&
          credentials.password === supervisorCredentials.password
        ) {
          resolve({
            user: {
              id: '2',
              name: 'Supervisor User',
              email: credentials.email,
              role: "supervisor" as const
            },
            token: 'fake-supervisor-token'
          });
        } else {
          reject(new Error('Invalid supervisor credentials'));
        }
      }, 1000);
    });
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gradient-to-br from-[#f9f6ff] to-[#fff] p-4 mt-16">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md border-t-8 border-[#6339C0] relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-[#6339C0]">Login to Little Steps</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[#6339C0]" size={20} />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com or supervisor@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#6339C0]" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="admin123 or supervisor123"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="accent-[#6339C0]"
              />
              Remember me
            </label>
            <Link to="/forgot" className="text-[#6339C0] text-sm hover:underline">Forgot password?</Link>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#6339C0] font-semibold hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;