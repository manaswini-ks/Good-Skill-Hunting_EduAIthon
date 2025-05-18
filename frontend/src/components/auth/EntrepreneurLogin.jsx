import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

function EntrepreneurLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role: 'entrepreneur' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      if (data.user.role !== 'entrepreneur') {
        throw new Error('Invalid role for this login page');
      }
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('entrepreneur_id', data.user.id);
      
      // Force a page reload to update user state in App component
      window.location.href = '/entrepreneur/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-secondary-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-soft rounded-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-secondary-100 p-4 rounded-full">
                  <LogIn className="w-12 h-12 text-secondary-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Entrepreneur Login
              </h2>
              <p className="text-gray-500 mt-2">
                Access your company dashboard
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle className="mr-3 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-secondary w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a 
                href="/forgot-password" 
                className="text-sm text-secondary-600 hover:text-secondary-800 transition"
              >
                Forgot password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntrepreneurLogin; 