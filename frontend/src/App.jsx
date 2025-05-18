// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MentorSelect from './pages/MentorSelect.jsx';
import MentorLogin from './components/auth/MentorLogin';
import EntrepreneurLogin from './components/auth/EntrepreneurLogin';
import StudentLogin from './components/auth/StudentLogin';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import { User, LogOut, Menu, X } from 'lucide-react';
import MentorProfile from './pages/mentor/MentorProfile';
import MentorConnections from './pages/mentor/Connections';
import QuestionDetails from  './components/dashboard/QuestionDetails';
import QuestionsList from './components/dashboard/QuestionsList';
// Import dashboard components
import StudentDashboard from './pages/student/Dashboard';
import EntrepreneurDashboard from './pages/entrepreneur/Dashboard';
import MentorDashboard from './pages/mentor/Dashboard';

// Import entrepreneur pages
import HiringBoard from './pages/entrepreneur/HiringBoard';
import Applicants from './pages/entrepreneur/Applicants';
import EntrepreneurProfile from './pages/entrepreneur/EntrepreneurProfile';

// Import student pages
import Opportunities from './pages/student/Opportunities';
import OpportunityDetail from './pages/student/OpportunityDetail';
import MyApplications from './pages/student/MyApplications';
import Learn from './pages/student/Learn';
import ProjectShowcase from './pages/student/ProjectShowcase';
import StudentProfile from './pages/student/StudentProfile';
import PersonalizedRoadmap from './pages/student/PersonalizedRoadmap';

function App() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('student_id');
    localStorage.removeItem('mentor_id');
    localStorage.removeItem('entrepreneur_id');
    setUser(null);
    window.location.href = '/';
  };

  // Function to get dashboard URL based on user role
  const getDashboardUrl = (role) => {
    switch(role) {
      case 'student': return '/student/opportunities';
      case 'entrepreneur': return '/entrepreneur/hiring-board';
      case 'mentor': return '/mentor/sessions';
      default: return '/';
    }
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Toast notifications */}
        <Toaster position="top-right" />
        
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-2xl font-heading font-bold text-primary-600">
                    EduSpark
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                  <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                    Home
                  </Link>
                 </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                  <Link to="/questions" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                    FAQ
                  </Link>
                 </div>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
              
              {/* Desktop nav items */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {user ? (
                  <>
                    <Link 
                      to={getDashboardUrl(user.role)} 
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 flex items-center"
                    >
                      <User className="h-4 w-4 mr-1" />
                      {user.name}
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="px-4 py-2 text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 transition-colors flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative group">
                      <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                        Login
                      </Link>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Student Login
                        </Link>
                        <Link to="/login/mentor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Mentor Login
                        </Link>
                        <Link to="/login/entrepreneur" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Entrepreneur Login
                        </Link>
                      </div>
                    </div>
                    <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 transition-colors">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="sm:hidden bg-white border-b border-gray-200">
              <div className="pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/mentors"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mentors
                </Link>
                
                {user && user.role === 'mentor' && (
                  <Link
                    to="/mentor/connections"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connections
                  </Link>
                )}
                
                {user ? (
                  <>
                    <Link
                      to={getDashboardUrl(user.role)}
                      className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Dashboard
                      </div>
                    </Link>
                    <div className="pl-3 pr-4 py-2 text-base font-medium text-gray-700">
                      Welcome, {user.name}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left block pl-3 pr-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Student Login
                    </Link>
                    <Link
                      to="/login/mentor"
                      className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mentor Login
                    </Link>
                    <Link
                      to="/login/entrepreneur"
                      className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Entrepreneur Login
                    </Link>
                    <Link
                      to="/register"
                      className="block pl-3 pr-4 py-2 text-base font-medium text-primary-600 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="flex-grow mt-16">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/mentors" element={<MentorSelect />} />
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/login/mentor" element={<MentorLogin />} />
            <Route path="/login/entrepreneur" element={<EntrepreneurLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/questions" element={<QuestionsList />} />
            <Route path="/questions/:questionId" element={<QuestionDetails />} />  
            
            {/* Student routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/learn" element={<Learn />} />
            <Route path="/student/mentorship" element={<ComingSoon title="Student Mentorship" />} />
            <Route path="/student/opportunities" element={<Opportunities />} />
            <Route path="/student/opportunities/:id" element={<OpportunityDetail />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/projects" element={<ProjectShowcase />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/profile/:id" element={<StudentProfile />} />
            <Route path="/student/personalized-roadmap" element={<PersonalizedRoadmap />} />
            
            {/* Entrepreneur routes */}
            <Route path="/entrepreneur/dashboard" element={<EntrepreneurDashboard />} />
            <Route path="/entrepreneur/profile" element={<EntrepreneurProfile />} />
            <Route path="/entrepreneur/profile/:id" element={<EntrepreneurProfile />} />
            <Route path="/entrepreneur/notifications" element={<ComingSoon title="Entrepreneur Notifications" />} />
            <Route path="/entrepreneur/hiring-board" element={<HiringBoard />} />
            <Route path="/entrepreneur/hiring-board/:entrepreneurId/:jobId/applicants" element={<Applicants />} />
            
            {/* Mentor routes */}
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/mentor/profile" element={<MentorProfile />} />
            <Route path="/mentor/connections" element={<MentorConnections />} />
            <Route path="/mentor/notifications" element={<ComingSoon title="Mentor Notifications" />} />
            <Route path="/mentor/sessions" element={<ComingSoon title="Mentor Sessions" />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}


function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-xl text-gray-600 mb-8">This feature is coming soon!</p>
      <p className="text-gray-500 max-w-md text-center">
        We're working hard to build this feature. Please check back later.
      </p>
    </div>
  );
}

function Home() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Redirect to appropriate dashboard if user is logged in
  if (user) {
    switch (user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" />;
      case 'mentor':
        return <Navigate to="/mentor/dashboard" />;
      case 'entrepreneur':
        return <Navigate to="/entrepreneur/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }
  
  // Otherwise show the home page for non-logged in users
  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient opacity-30"></div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Connect with <span className="text-gradient">Expert Mentors</span> for Your Journey
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              EduSpark connects students and startups with experienced mentors to help guide your educational and entrepreneurial journey.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link to="/register" className="btn-outline">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose EduSpark?</h2>
            <p className="mt-4 text-lg text-gray-600">We connect you with industry experts who can guide your journey.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                title: 'Expert Mentors',
                description: 'Connect with industry professionals who have years of experience in their fields.',
              
              },
              {
                title: 'Personalized Guidance',
                description: 'Get tailored advice and feedback specific to your goals and challenges.',
            
              },
              {
                title: 'Networking Opportunities',
                description: 'Build valuable connections that can help advance your career or startup.',
             
              },
            ].map((feature, index) => (
              <div key={index} className="card flex flex-col items-start">
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
