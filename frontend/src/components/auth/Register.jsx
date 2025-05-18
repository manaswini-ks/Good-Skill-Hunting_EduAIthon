import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ChevronDown, 
  AlertTriangle 
} from 'lucide-react';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    interests: '',
    company: '',
    industry: '',
    stage: '',
    availability: '',
    expertise: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const processedData = { ...formData };

      if (processedData.role === 'student' && processedData.interests) {
        processedData.interests = processedData.interests.split(',').map(item => item.trim());
      }
      if (processedData.role === 'mentor') {
        if (processedData.expertise) {
          processedData.expertise = processedData.expertise.split(',').map(item => item.trim());
        }
        if (processedData.availability) {
          processedData.availability = processedData.availability.split(',').map(item => item.trim());
        }
      }

      console.log('Submitting registration data:', processedData);
      
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(processedData)
      });
      
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Error parsing response:', err);
        throw new Error('Invalid server response');
      }
      
      console.log('Registration response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }
      
      setError('');
      alert('Registration successful! Redirecting to login...');
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const dashboardRoutes = {
        student: '/student/dashboard',
        entrepreneur: '/entrepreneur/dashboard',
        mentor: '/mentor/dashboard'
      };
      
      window.location.href = dashboardRoutes[formData.role] || '/';
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-soft rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-accent-100 p-4 rounded-full">
                <Users className="w-12 h-12 text-accent-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              EduSpark
            </h2>
            <p className="text-gray-500 mt-2">
              Educational Mentorship Platform
            </p>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => navigate('/login/entrepreneur')}
              className="flex-1 btn-secondary"
            >
              Entrepreneur Login
            </button>
            <button
              onClick={() => navigate('/login/mentor')}
              className="flex-1 btn-primary"
            >
              Mentor Login
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Register New Account
              </span>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertTriangle className="mr-3 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" />
              </div>
              <input
                name="name"
                type="text"
                required
                className="input pl-10"
                placeholder="Full Name"
                onChange={handleChange}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-gray-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                className="input pl-10"
                placeholder="Email address"
                onChange={handleChange}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="text-gray-400" />
              </div>
              <input
                name="phone"
                type="tel"
                required
                className="input pl-10"
                placeholder="Phone number"
                onChange={handleChange}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" />
              </div>
              <input
                name="password"
                type="password"
                required
                className="input pl-10"
                placeholder="Password"
                onChange={handleChange}
              />
            </div>
            
            <div className="relative">
              <select
                name="role"
                required
                className="input appearance-none"
                onChange={handleChange}
                value={formData.role}
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="mentor">Mentor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown />
              </div>
            </div>
            
            {formData.role === 'student' && (
              <div className="relative">
                <input
                  name="interests"
                  type="text"
                  required
                  className="input"
                  placeholder="Interests (comma-separated)"
                  value={formData.interests}
                  onChange={handleChange}
                />
              </div>
            )}
            
            {formData.role === 'entrepreneur' && (
              <>
                <div className="relative">
                  <input
                    name="company"
                    type="text"
                    required
                    className="input"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <input
                    name="industry"
                    type="text"
                    required
                    className="input"
                    placeholder="Industry"
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <select
                    name="stage"
                    required
                    className="input appearance-none"
                    value={formData.stage}
                    onChange={handleChange}
                  >
                    <option value="">Select Company Stage</option>
                    <option value="Idea">Idea</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Early-stage">Early-stage</option>
                    <option value="Growth">Growth</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown />
                  </div>
                </div>
              </>
            )}
            
            {formData.role === 'mentor' && (
              <>
                <div className="relative">
                  <input
                    name="availability"
                    type="text"
                    required
                    className="input"
                    placeholder="Availability (comma-separated)"
                    value={formData.availability}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <input
                    name="expertise"
                    type="text"
                    required
                    className="input"
                    placeholder="Expertise (comma-separated)"
                    value={formData.expertise}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-accent w-full"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register; 