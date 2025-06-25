import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle signup logic here
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gradient-to-br from-[#f9f6ff] to-[#fff] p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md border-t-8 border-[#6339C0] relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-[#6339C0]">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-[#6339C0]" size={20} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your Name"
              />
            </div>
          </div>
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
                placeholder="you@email.com"
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
                placeholder="Password"
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
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#6339C0]" size={20} />
              <input
                type={showConfirm ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6339C0]"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Confirm Password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
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