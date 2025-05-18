import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, Lock } from 'lucide-react';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }
      
      setSuccess('Password reset instructions have been sent to your email.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-soft rounded-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <Lock className="w-12 h-12 text-primary-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Reset Password
              </h2>
              <p className="text-gray-500 mt-2">
                Enter your email to receive reset instructions
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle className="mr-3 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Processing...' : 'Reset Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  Back to login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 