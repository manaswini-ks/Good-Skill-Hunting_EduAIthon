import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Search, Briefcase, MapPin, Calendar, Filter, Clock, X, Send, AlertCircle, CheckCircle } from 'lucide-react';

function Opportunities() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    types: [],
    location: 'all',
    skills: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [apiError, setApiError] = useState('');
  const [userApplications, setUserApplications] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applicationData, setApplicationData] = useState({
    message: '',
    resume: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // Get user data from localStorage (auth data only)
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch opportunities from API
    async function fetchOpportunities() {
      try {
        const response = await fetch('http://localhost:5000/shared/opportunities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch opportunities');
        }
        
        const data = await response.json();
        setOpportunities(data);
        setFilteredOpportunities(data);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setApiError('Failed to load opportunities. Please try again later.');
        setOpportunities([]);
        setFilteredOpportunities([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOpportunities();
  }, []);

  // Fetch user applications to check which opportunities the user has already applied for
  useEffect(() => {
    if (user && user.id) {
      fetchUserApplications(user.id);
    }
  }, [user]);

  const fetchUserApplications = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/student/applications/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user applications');
      }
      const data = await response.json();
      setUserApplications(data);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const hasApplied = (opportunityId) => {
    return userApplications.some(app => app.opportunityId === opportunityId);
  };

  useEffect(() => {
    // Apply filters and search
    let result = [...opportunities];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(opportunity => 
        opportunity.title.toLowerCase().includes(term) || 
        (opportunity.company && opportunity.company.toLowerCase().includes(term)) ||
        (opportunity.description && opportunity.description.toLowerCase().includes(term)) ||
        (opportunity.requirements && 
          opportunity.requirements.some(req => req.toLowerCase().includes(term))) ||
        (opportunity.responsibilities && 
          opportunity.responsibilities.some(resp => resp.toLowerCase().includes(term))) ||
        (opportunity.skills && 
          opportunity.skills.some(skill => skill.toLowerCase().includes(term)))
      );
    }
    
    // Apply type filter
    if (filters.types.length > 0) {
      result = result.filter(opportunity => 
        filters.types.includes(opportunity.type)
      );
    }
    
    // Apply location filter
    if (filters.location !== 'all') {
      result = result.filter(opportunity => 
        opportunity.location === filters.location
      );
    }
    
    // Apply skills filter
    if (filters.skills.length > 0) {
      result = result.filter(opportunity => 
        filters.skills.some(skill => 
          opportunity.skills && opportunity.skills.includes(skill)
        )
      );
    }
    
    setFilteredOpportunities(result);
  }, [searchTerm, filters, opportunities]);

  // If not logged in or not a student, redirect to login
  if (!loading && (!user || user.role !== 'student')) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const toggleFilter = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'types') {
        if (newFilters.types.includes(value)) {
          newFilters.types = newFilters.types.filter(type => type !== value);
        } else {
          newFilters.types = [...newFilters.types, value];
        }
      } else if (filterType === 'location') {
        newFilters.location = value;
      } else if (filterType === 'skills') {
        if (newFilters.skills.includes(value)) {
          newFilters.skills = newFilters.skills.filter(skill => skill !== value);
        } else {
          newFilters.skills = [...newFilters.skills, value];
        }
      }
      
      return newFilters;
    });
  };

  // Get all unique skills from opportunities
  const allSkills = [...new Set(opportunities
    .filter(opportunity => opportunity.skills)
    .flatMap(opportunity => opportunity.skills))];

  // Handle opening the application modal
  const handleOpenApplyModal = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowApplyModal(true);
    setApplicationData({
      message: '',
      resume: null
    });
    setError('');
    setSuccess(false);
  };

  const handleInputChange = (e) => {
    setApplicationData({
      ...applicationData,
      message: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setApplicationData({
      ...applicationData,
      resume: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo(null);
    setSubmitting(true);
    
    // Validate
    if (!applicationData.message.trim()) {
      setError('Please include a message with your application.');
      setSubmitting(false);
      return;
    }
    
    if (!applicationData.resume) {
      setError('Please upload your resume.');
      setSubmitting(false);
      return;
    }
    
    try {
      // Prepare application data
      const formData = new FormData();
      formData.append('message', applicationData.message);
      formData.append('resume', applicationData.resume);
      formData.append('opportunityId', selectedOpportunity._id);
      formData.append('studentId', user.id);
      
      console.log("Submitting application with student ID:", user.id);
      
      // Submit application to the database via API
      const response = await fetch(`http://localhost:5000/student/applications/${user.id}`, {
        method: 'POST',
        body: formData
      });
      
      // Try to parse the response regardless of status
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }
      
      // Check response status
      if (!response.ok) {
        console.error("API error response:", data);
        setDebugInfo(data);
        throw new Error(data.error || 'Failed to submit application');
      }
      
      console.log("Application submitted successfully:", data);
      setSuccess(true);
      
      // Update the user applications list
      fetchUserApplications(user.id);
      
      // Close modal after showing success message
      setTimeout(() => {
        setShowApplyModal(false);
        setSuccess(false);
        setApplicationData({
          message: '',
          resume: null
        });
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to submit application. Please try again.');
      console.error('Error submitting application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
          <p className="mt-2 text-gray-600">Discover internships and job opportunities from startups.</p>
        </div>
        
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {apiError}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Panel - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white shadow rounded-lg p-4 sticky top-20">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Role Type</h3>
                <div className="space-y-2">
                  {['Internship', 'Part-time'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => toggleFilter('types', type)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.location === 'all'}
                      onChange={() => toggleFilter('location', 'all')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.location === 'Remote'}
                      onChange={() => toggleFilter('location', 'Remote')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remote</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.location === 'On-site'}
                      onChange={() => toggleFilter('location', 'On-site')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">On-site</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.location === 'Hybrid'}
                      onChange={() => toggleFilter('location', 'Hybrid')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Hybrid</span>
                  </label>
                </div>
              </div>
              
              {allSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Skills</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allSkills.map(skill => (
                      <label key={skill} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.skills.includes(skill)}
                          onChange={() => toggleFilter('skills', skill)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title or company"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </button>
                
                <Link
                  to="/student/applications"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                >
                  My Applications
                </Link>
              </div>
              
              {/* Mobile Filters */}
              {showFilters && (
                <div className="md:hidden mt-4 bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Role Type</h4>
                    <div className="space-y-2">
                      {['Internship', 'Part-time', 'PoC'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={() => toggleFilter('types', type)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Location</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={filters.location === 'all'}
                          onChange={() => toggleFilter('location', 'all')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">All</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={filters.location === 'Remote'}
                          onChange={() => toggleFilter('location', 'Remote')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Remote</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={filters.location === 'On-site'}
                          onChange={() => toggleFilter('location', 'On-site')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">On-site</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={filters.location === 'Hybrid'}
                          onChange={() => toggleFilter('location', 'Hybrid')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Hybrid</span>
                      </label>
                    </div>
                  </div>
                  
                  {allSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {allSkills.map(skill => (
                          <label key={skill} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.skills.includes(skill)}
                              onChange={() => toggleFilter('skills', skill)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{skill}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Applied filters */}
              {(filters.types.length > 0 || filters.location !== 'all' || filters.skills.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.types.map(type => (
                    <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {type}
                      <button
                        onClick={() => toggleFilter('types', type)}
                        className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                  
                  {filters.location !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {filters.location}
                      <button
                        onClick={() => toggleFilter('location', 'all')}
                        className="ml-1 text-green-500 hover:text-green-700 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  )}
                  
                  {filters.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {skill}
                      <button
                        onClick={() => toggleFilter('skills', skill)}
                        className="ml-1 text-purple-500 hover:text-purple-700 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {filteredOpportunities.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
                  <Briefcase className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No opportunities available</h2>
                <p className="text-gray-500">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredOpportunities.map(opportunity => (
                  <div 
                    key={opportunity._id}
                    className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{opportunity.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{opportunity.company || 'Company'}</p>
                      
                      <div className="mt-3 flex items-center text-sm text-gray-500 gap-4">
                        <span className="flex items-center">
                          <Briefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {opportunity.type}
                        </span>
                        
                        <span className="flex items-center">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {opportunity.location}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1 mb-4">
                          {opportunity.skills && opportunity.skills.slice(0, 3).map((skill, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {opportunity.skills && opportunity.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{opportunity.skills.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            Posted {new Date(opportunity.postedDate).toLocaleDateString()}
                          </span>
                          {opportunity.stipend && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {opportunity.stipend}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <Link 
                            to={`/student/opportunities/${opportunity._id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-800"
                          >
                            View Details
                          </Link>
                          {hasApplied(opportunity._id) ? (
                            <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded">
                              Applied
                            </span>
                          ) : (
                            <Link
                              to={`/student/opportunities/${opportunity._id}`}
                              className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 focus:outline-none"
                            >
                              Apply Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Apply for {selectedOpportunity.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedOpportunity.company || "Company"}
              </p>
            </div>
            
            {success ? (
              <div className="p-6">
                <div className="flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <p className="text-center text-lg font-medium text-gray-900">
                  Application Submitted Successfully!
                </p>
                <p className="text-center text-gray-500 mt-2">
                  Your application has been sent to {selectedOpportunity.company || "the company"}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="mr-3 text-red-500" />
                    <div>
                      <div className="font-bold">Error:</div>
                      <div>{error}</div>
                      
                      {debugInfo && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <details>
                            <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
                            <pre className="mt-2 text-xs overflow-auto bg-red-100 p-2 rounded">
                              {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h2>
                  <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-5">
                    {selectedOpportunity.requirements ? (
                      selectedOpportunity.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))
                    ) : (
                      <>
                        <li>Required skills as listed</li>
                        <li>Good communication skills</li>
                        <li>Ability to work in a team environment</li>
                        <li>Self-motivated and proactive</li>
                      </>
                    )}
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Responsibilities</h2>
                  <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-5">
                    {selectedOpportunity.responsibilities ? (
                      selectedOpportunity.responsibilities.map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))
                    ) : (
                      <>
                        <li>Collaborate with team members on projects</li>
                        <li>Implement features based on specifications</li>
                        <li>Test and debug applications</li>
                        <li>Participate in code reviews</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message to Employer
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={applicationData.message}
                    onChange={handleInputChange}
                    placeholder="Explain why you're a good fit for this role..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                    Upload Resume
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="resume"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="resume"
                            name="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX up to 2MB
                      </p>
                    </div>
                  </div>
                  {applicationData.resume && (
                    <p className="mt-2 text-sm text-gray-500">
                      Selected file: {applicationData.resume.name}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Opportunities; 