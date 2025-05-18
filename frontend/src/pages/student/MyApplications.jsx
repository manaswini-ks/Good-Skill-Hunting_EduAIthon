import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ChevronLeft, Briefcase, Clock, Calendar, FileText, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

function MyApplications() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [apiError, setApiError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      console.log("User data:", user);
      
      if (user && user.id) {
        setRefreshing(true);
        const response = await fetch(`http://localhost:5000/student/applications/${user.id}`);
        
        let data;
        try {
          data = await response.json();
        } catch (error) {
          console.error("Failed to parse JSON response:", error);
          throw new Error("Invalid response from server");
        }
        
        if (!response.ok) {
          console.error("API error response:", data);
          setDebugInfo(data);
          throw new Error(data.error || 'Failed to fetch applications');
        }
        
        console.log("Applications data:", data);
        setApplications(data);
        setApiError('');
      } else {
        throw new Error('User ID not found');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApiError('Failed to load applications. ' + error.message);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch applications from API
    fetchApplications();
  }, []);

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

  function getStatusBadge(status) {
    switch(status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="mt-1 text-gray-600">Track the status of your job applications</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchApplications}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link
                to="/student/opportunities"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Opportunities
              </Link>
            </div>
          </div>
          
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
        </div>
        
        {applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-500 mb-6">You haven't applied to any opportunities yet.</p>
            <Link 
              to="/student/opportunities" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none inline-block"
            >
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map(application => (
                <li key={application._id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {application.opportunity ? application.opportunity.title : 'Opportunity Title'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {application.opportunity ? application.opportunity.company : 'Company'}
                        </p>
                        
                        <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-3">
                          {application.opportunity && (
                            <>
                              <div className="flex items-center">
                                <Briefcase className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                <p>{application.opportunity.type}</p>
                              </div>
                              {application.opportunity.location && (
                                <div className="flex items-center">
                                  <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  <p>{application.opportunity.location}</p>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex items-center">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>Applied on {new Date(application.appliedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Your Application</h4>
                      <p className="text-sm text-gray-600 mb-2">{application.message}</p>
                      {application.resumeName && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FileText className="h-4 w-4 mr-1.5 text-gray-400" />
                          <p>Resume: {application.resumeName}</p>
                        </div>
                      )}
                    </div>
                    
                    {application.opportunity && (
                      <div className="mt-4">
                        <Link 
                          to={`/student/opportunities/${application.opportunityId}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          View Opportunity Details
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications; 