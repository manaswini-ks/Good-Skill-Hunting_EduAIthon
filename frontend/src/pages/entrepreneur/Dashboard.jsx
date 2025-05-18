import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Building2, Briefcase, Users, Search } from 'lucide-react';
import MentorCard from '../../components/MentorCard';
import { mentorAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

// Mock data for when backend is not available
const MOCK_MENTORS = [
  {
    id: 'mock1',
    name: 'Dr. Jane Smith',
    title: 'Tech Lead at Google',
    experience: 12,
    expertise: ['AI/ML', 'Web Development', 'Career Growth'],
    bio: 'Experienced tech leader with background in AI and software engineering.',
    image: null
  },
  {
    id: 'mock2',
    name: 'Michael Johnson',
    title: 'Startup Advisor',
    experience: 8,
    expertise: ['Entrepreneurship', 'Product Strategy', 'Fundraising'],
    bio: 'Serial entrepreneur who has raised over $10M in venture funding.',
    image: null
  },
  {
    id: 'mock3',
    name: 'Sarah Williams',
    title: 'CTO at TechStart',
    experience: 15,
    expertise: ['System Architecture', 'Cloud Infrastructure', 'Team Building'],
    bio: 'Technical leader specializing in scalable architectures and team development.',
    image: null
  }
];

function EntrepreneurDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if backend is available
      fetch('http://localhost:5000/health', { method: 'GET', timeout: 5000 })
        .then(response => {
          if (response.ok) {
            setBackendAvailable(true);
            // Only fetch data if backend is available
            fetchMentors(parsedUser.id);
            fetchConnections(parsedUser.id);
          } else {
            console.warn("Backend returned non-OK status:", response.status);
            handleBackendUnavailable();
          }
        })
        .catch(err => {
          console.warn("Backend connection failed:", err);
          handleBackendUnavailable();
        });
    } else {
      setLoading(false);
    }
  }, []);
  
  const handleBackendUnavailable = () => {
    setBackendAvailable(false);
    setFeaturedMentors(MOCK_MENTORS);
    setConnections([]);
    setLoading(false);
    toast.error("Cannot connect to the server. Using demo mode.", { duration: 5000 });
  };

  const fetchMentors = async (userId) => {
    try {
      setLoadingMentors(true);
      setMatchError(null);
      
      // Try to get matching mentors first
      try {
        const matchingResponse = await mentorAPI.getMatchingMentors(userId);
        
        if (matchingResponse && matchingResponse.data && matchingResponse.data.matches) {
          // Get full mentor details for each match
          const mentorDetails = await Promise.all(
            matchingResponse.data.matches.slice(0, 3).map(async (match) => {
              try {
                const mentorResponse = await mentorAPI.getMentorById(match.mentor_id);
                return {
                  ...mentorResponse.data,
                  similarity_score: match.similarity_score
                };
              } catch (err) {
                console.error(`Error fetching mentor details for ${match.mentor_id}:`, err);
                return null;
              }
            })
          );
          
          // Filter out any null results
          const validMentors = mentorDetails.filter(mentor => mentor !== null);
          
          if (validMentors.length > 0) {
            setFeaturedMentors(validMentors);
            setLoadingMentors(false);
            return;
          }
        }
        
        // If we don't have valid mentor matches, fall back to getting all mentors
        fallbackToAllMentors();
        
      } catch (err) {
        console.warn('Matching service error, falling back to all mentors:', err);
        fallbackToAllMentors();
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setMatchError("Unable to connect to mentor services");
      setFeaturedMentors([]);
      setLoadingMentors(false);
    }
  };
  
  const fallbackToAllMentors = async () => {
    try {
      const allMentorsRes = await mentorAPI.getAllMentors();
      
      if (allMentorsRes && allMentorsRes.data && allMentorsRes.data.length > 0) {
        // Just take the first 3 mentors as featured
        const featuredMentors = allMentorsRes.data.slice(0, 3);
        setFeaturedMentors(featuredMentors);
      } else {
        setFeaturedMentors([]);
      }
    } catch (err) {
      console.error('Error fetching all mentors:', err);
      setMatchError("Unable to connect to mentor services");
      setFeaturedMentors([]);
    } finally {
      setLoadingMentors(false);
    }
  };

  const fetchConnections = async (entrepreneurId) => {
    try {
      setLoadingConnections(true);
      const response = await mentorAPI.getUserConnections(entrepreneurId, 'entrepreneur');
      
      if (response && response.data && response.data.length > 0) {
        // Fetch mentor details for each connection
        const connectionsWithDetails = await Promise.all(
          response.data.map(async (connection) => {
            try {
              const mentorResponse = await mentorAPI.getMentorById(connection.mentor_id);
              return {
                ...connection,
                mentorName: mentorResponse.data.name || 'Unknown Mentor',
                mentorExpertise: mentorResponse.data.expertise || [],
                mentorTitle: mentorResponse.data.title || ''
              };
            } catch (err) {
              console.error(`Error fetching mentor details for ${connection.mentor_id}:`, err);
              return {
                ...connection,
                mentorName: 'Unknown Mentor',
                mentorExpertise: [],
                mentorTitle: ''
              };
            }
          })
        );
        setConnections(connectionsWithDetails);
      } else {
        setConnections([]);
      }
      setLoadingConnections(false);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  if (!loading && (!user || user.role !== 'entrepreneur')) {
    return <Navigate to="/login/entrepreneur" />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>;
  }

  const handleRequestConnection = async (mentorId) => {
    if (!backendAvailable) {
      toast.error("Server is unavailable. Cannot send connection requests in demo mode.");
      return false;
    }
    
    try {
      await mentorAPI.requestConnection({
        mentorId,
        userId: user.id,
        userRole: user.role
      });
      toast.success('Connection request sent successfully!');
      return true;
    } catch (error) {
      console.error('Error requesting connection:', error);
      toast.error('Failed to request connection. Please try again.');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!backendAvailable && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p className="font-bold">Backend Connection Issue</p>
            <p>We're having trouble connecting to the server. You're currently viewing demo data in offline mode.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              Retry Connection
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard Cards */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="ml-4 text-lg font-semibold">Company Profile</h2>
            </div>
            <p className="text-gray-600">Manage your company details and information</p>
            <Link to="/entrepreneur/profile" className="mt-4 text-primary-600 hover:text-primary-800 font-medium text-sm inline-block">
              View Profile →
            </Link>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Briefcase className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="ml-4 text-lg font-semibold">Hiring Board</h2>
            </div>
            <p className="text-gray-600">Post jobs and find talent for your startup</p>
            <Link to="/entrepreneur/hiring-board" className="mt-4 text-primary-600 hover:text-primary-800 font-medium text-sm inline-block">
              Manage Jobs →
            </Link>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Featured Mentors</h2>
              <Link to="/mentors" className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center">
                <Search className="h-4 w-4 mr-1" />
                Find More Mentors
              </Link>
            </div>
            
            {loadingMentors ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading mentors...</span>
              </div>
            ) : featuredMentors.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {featuredMentors.map((mentor, index) => (
                  <MentorCard 
                    key={index}
                    mentor={mentor}
                    onRequestConnection={handleRequestConnection}
                    showSimilarityScore={backendAvailable && mentor.similarity_score}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {matchError 
                    ? matchError
                    : "No mentors available at the moment."}
                </p>
                <Link 
                  to="/mentors"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Browse All Mentors
                </Link>
            </div>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Mentor Connections</h2>
            
            {loadingConnections ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading connections...</span>
              </div>
            ) : connections.length > 0 ? (
            <div className="space-y-4">
                {connections.map((connection, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{connection.mentorName}</div>
                        {connection.mentorTitle && (
                          <div className="text-xs text-gray-500 mb-1">{connection.mentorTitle}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          Status: <span className={
                            connection.status === 'pending' ? 'text-yellow-600' : 
                            connection.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                          }>
                            {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                          </span>
                        </div>
                        {connection.mentorExpertise && connection.mentorExpertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {connection.mentorExpertise.slice(0, 2).map((expertise, i) => (
                              <span key={i} className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                                {expertise}
                              </span>
                            ))}
                            {connection.mentorExpertise.length > 2 && (
                              <span className="text-xs text-gray-500">+{connection.mentorExpertise.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't connected with any mentors yet.</p>
                <Link 
                  to="/mentors"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Find Mentors
                </Link>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntrepreneurDashboard; 