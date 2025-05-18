import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, Download, ExternalLink, BookOpen, Code } from 'lucide-react';

function Applicants() {
  const { entrepreneurId, jobId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    // Get user data from localStorage (auth data only)
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch opportunity and applicants from API
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch opportunity details
        const opportunityResponse = await fetch(`http://localhost:5000/entrepreneur/opportunities/${entrepreneurId}/${jobId}`);
        
        if (!opportunityResponse.ok) {
          const opportunityErrorData = await opportunityResponse.json();
          console.error("Opportunity API error:", opportunityErrorData);
          throw new Error(opportunityErrorData.error || 'Failed to fetch opportunity details');
        }
        
        const opportunityData = await opportunityResponse.json();
        setOpportunity(opportunityData);
      
        // Fetch applicants for this opportunity
        const applicantsResponse = await fetch(`http://localhost:5000/entrepreneur/opportunities/${entrepreneurId}/${jobId}/applications`);
        
        if (!applicantsResponse.ok) {
          const applicantsErrorData = await applicantsResponse.json();
          console.error("Applicants API error:", applicantsErrorData);
          throw new Error(applicantsErrorData.error || 'Failed to fetch applicants');
        }
        
        const applicantsData = await applicantsResponse.json();
        console.log("Applicants data:", applicantsData);
        
        // Format dates in applicants data
        const processedApplicants = applicantsData.map(applicant => {
          return {
            ...applicant,
            formattedAppliedDate: applicant.appliedDate 
              ? new Date(applicant.appliedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Unknown date'
          };
        });
        
        setApplicants(processedApplicants);
      } catch (error) {
        console.error('Error fetching data:', error);
        setApiError(error.message || 'Failed to load data');
      } finally {
    setLoading(false);
      }
    }
    
    fetchData();
  }, [entrepreneurId, jobId]);

  // If not logged in or not an entrepreneur, redirect to login
  if (!loading && (!user || user.role !== 'entrepreneur')) {
    return <Navigate to="/login/entrepreneur" />;
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
              <ChevronLeft className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Opportunity not found</h2>
            <p className="text-gray-500 mb-6">The opportunity you are looking for does not exist or has been removed.</p>
            <Link 
              to="/entrepreneur/hiring-board" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none inline-block"
            >
              Back to Hiring Board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      // Update the application status via API
      const response = await fetch(`http://localhost:5000/entrepreneur/applications/${entrepreneurId}/${applicantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
    
    // Update the local state to reflect the change
    setApplicants(applicants.map(applicant => 
        applicant._id === applicantId 
        ? { ...applicant, status: newStatus } 
        : applicant
    ));
    } catch (error) {
      console.error('Error updating application status:', error);
      setApiError('Failed to update application status. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            to="/entrepreneur/hiring-board" 
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Hiring Board
          </Link>
          
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
              {apiError}
            </div>
          )}
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Applicants for {opportunity.title}
            </h1>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-500 flex-wrap gap-3">
                {opportunity.type && (
                  <div className="flex items-center">
                    <span>{opportunity.type}</span>
                  </div>
                )}
                {opportunity.duration && (
                  <div className="flex items-center">
                    <span>{opportunity.duration}</span>
                  </div>
                )}
                {opportunity.location && (
                  <div className="flex items-center">
                    <span>{opportunity.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {opportunity.skills && opportunity.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {applicants.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications received yet</h2>
            <p className="text-gray-500">When students apply for this opportunity, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applicants.map((applicant) => (
                <li key={applicant._id} className="px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        {applicant.student?.fullName || applicant.studentName || 'Student'}
                        {applicant.status && applicant.status !== 'pending' && (
                        <span 
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(applicant.status)}`}
                        >
                          {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                        </span>
                        )}
                      </h3>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-3">
                        <div className="flex items-center">
                          <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <a href={`mailto:${applicant.student?.email || applicant.email || 'student@example.com'}`} className="hover:text-primary-600">
                            {applicant.student?.email || applicant.email || 'student@example.com'}
                          </a>
                        </div>
                        {(applicant.student?.phone || applicant.phone) && (
                          <div className="flex items-center">
                            <Phone className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <a href={`tel:${applicant.student?.phone || applicant.phone}`} className="hover:text-primary-600">
                              {applicant.student?.phone || applicant.phone}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">{applicant.message}</p>
                      </div>
                      
                      {/* Skills section */}
                        <div className="mt-3 flex flex-wrap gap-2">
                        {applicant.student?.skills ? (
                          // Get skills from student profile if available
                          applicant.student.skills.map((skillObj, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {skillObj.name || skillObj}
                            </span>
                          ))
                        ) : applicant.skills ? (
                          // Fallback to applicant skills
                          applicant.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {skill}
                            </span>
                          ))
                        ) : null}
                      </div>
                      
                      {/* Student's projects section */}
                      {applicant.student?.projects && applicant.student.projects.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Code className="h-4 w-4 mr-1.5 text-primary-500" />
                            Projects
                          </h4>
                          <div className="space-y-3">
                            {applicant.student.projects.slice(0, 2).map((project, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded-md">
                                <div className="font-medium text-sm">{project.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{project.description?.substring(0, 100)}...</div>
                                {project.link && (
                                  <a 
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer" 
                                    className="text-xs text-primary-600 hover:underline mt-1 inline-flex items-center"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View Project
                                  </a>
                                )}
                              </div>
                            ))}
                            {applicant.student.projects.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{applicant.student.projects.length - 2} more projects
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {applicant.resumeName && (
                        <div className="mt-3 text-sm">
                          <div className="inline-flex items-center text-primary-600">
                            <Download className="h-4 w-4 mr-1" />
                            Resume: {applicant.resumeName}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <select
                        value={applicant.status || 'pending'}
                        onChange={(e) => handleStatusChange(applicant._id, e.target.value)}
                        className={`block w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm ${
                          applicant.status === 'accepted' ? 
                            'border-green-300 text-green-800 bg-green-50' : 
                          applicant.status === 'rejected' ? 
                            'border-red-300 text-red-800 bg-red-50' : 
                            'border-gray-300 text-gray-700'
                        }`}
                      >
                        <option value="pending">Review Application</option>
                        <option value="accepted">Accept Application</option>
                        <option value="rejected">Reject Application</option>
                      </select>
                      
                      <div className="flex space-x-2">
                      <a 
                          href={`mailto:${applicant.student?.email || applicant.email || 'student@example.com'}`}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                          <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </a>
                        
                        <Link
                          to={`/student/profile/${applicant.student?._id || applicant.student_id}`}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {applicant.formattedAppliedDate && (
                    <div className="mt-2 text-xs text-gray-500">
                      Applied on {applicant.formattedAppliedDate}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Applicants; 