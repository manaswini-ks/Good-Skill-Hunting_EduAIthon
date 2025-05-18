import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ChevronLeft, Briefcase, MapPin, Clock, Calendar, Send, AlertCircle, CheckCircle } from 'lucide-react';

function OpportunityDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    message: '',
    resume: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  // Define fetchUserApplications function first
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

  // Function to check if user has already applied
  const hasApplied = () => {
    return userApplications.some(app => app.opportunityId === id);
  };

  async function fetchOpportunityDetails() {
    try {
      console.log(`Fetching opportunity details for ID: ${id}`);
      const response = await fetch(`http://localhost:5000/shared/opportunities/${id}`);
      
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
        throw new Error(data.error || 'Failed to fetch opportunity details');
      }
      
      console.log("Opportunity data received:", data);
      
      setOpportunity(data);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      setApiError('Failed to load opportunity details: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch user applications if user is logged in
      if (parsedUser && parsedUser.id) {
        fetchUserApplications(parsedUser.id);
      }
    }
    
    // Fetch opportunity details from API
    fetchOpportunityDetails();
  }, [id]);

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

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50">
      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Opportunity not found</h2>
            <p className="text-gray-500 mb-6">The opportunity you are looking for does not exist or has been removed.</p>
            <Link 
              to="/student/opportunities" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none inline-block"
            >
              Back to Opportunities
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      formData.append('opportunityId', opportunity._id);
      formData.append('studentId', user.id);
      
      console.log("Submitting application with student ID:", user.id);
      console.log("Application data:", {
        message: applicationData.message,
        resumeName: applicationData.resume.name,
        opportunityId: opportunity._id,
        studentId: user.id
      });
      
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
      
      // Refresh applications
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
          <Link 
            to="/student/opportunities" 
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Opportunities
          </Link>
          
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
              <div className="font-bold">Error:</div>
              <div>{apiError}</div>
              
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
          )}
          
          <div className="bg-white shadow rounded-lg overflow-hidden mt-4">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                {opportunity.companyLogo ? (
                  <img
                    src={opportunity.companyLogo}
                    alt={opportunity.company || "Company"}
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-primary-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{opportunity.title}</h1>
                  <p className="mt-1 text-lg text-gray-600">{opportunity.company || "Company"}</p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap items-center text-sm text-gray-500 gap-6">
                <div className="flex items-center">
                  <Briefcase className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <p>{opportunity.type}</p>
                </div>
                {opportunity.duration && (
                  <div className="flex items-center">
                    <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>{opportunity.duration}</p>
                  </div>
                )}
                {opportunity.location && (
                  <div className="flex items-center">
                    <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>{opportunity.location}</p>
                  </div>
                )}
                {opportunity.postedDate && (
                  <div className="flex items-center">
                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>Posted {new Date(opportunity.postedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              {opportunity.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                  <p className="mt-2 text-gray-600">{opportunity.description}</p>
                </div>
              )}
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Responsibilities</h2>
                <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-5">
                  {opportunity.responsibilities && opportunity.responsibilities.length > 0
                    ? opportunity.responsibilities.map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))
                    : [
                        'Collaborate with team members on projects',
                        'Implement features based on specifications',
                        'Test and debug applications',
                        'Participate in code reviews'
                      ].map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))
                  }
                </ul>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-5">
                  {opportunity.requirements && opportunity.requirements.length > 0
                    ? opportunity.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))
                    : [
                        'Required skills as listed',
                        'Good communication skills',
                        'Ability to work in a team environment',
                        'Self-motivated and proactive'
                      ].map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))
                  }
                </ul>
              </div>
              
              {opportunity.skills && opportunity.skills.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Skills Required</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {opportunity.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {opportunity.stipend && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Stipend</h2>
                  <p className="mt-2 text-gray-600">{opportunity.stipend}</p>
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                {hasApplied() ? (
                  <button
                    disabled
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 cursor-not-allowed"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Already Applied
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Apply for {opportunity.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {opportunity.company || "Company"}
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
                  Your application has been sent to {opportunity.company || "the company"}.
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

export default OpportunityDetail; 