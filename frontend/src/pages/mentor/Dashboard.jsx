import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User, Bell, Calendar, Users, Mail, BookOpen, ExternalLink } from 'lucide-react';
import { mentorAPI } from '../../utils/api';

function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);

    // Fetch accepted connections
    const mentorId = localStorage.getItem('mentor_id');
    if (mentorId) {
      fetchConnections(mentorId);
    }
  }, []);

  const fetchConnections = async (mentorId) => {
    try {
      setLoadingConnections(true);
      const response = await mentorAPI.getMentorConnections(mentorId);

      // Filter for accepted connections only
      const acceptedConnections = response.data.filter(conn => conn.status === 'accepted')
        .map(connection => {
          // Ensure we have valid user data
          if (!connection.user || !connection.user.fullName || connection.user.fullName === 'Unknown User') {
            // Use any available data to create a better user display
            const userData = connection.user_data || {};
            connection.user = {
              ...(connection.user || {}),
              fullName: userData.fullName || connection.studentName || 'Student',
              email: userData.email || connection.email || '',
              role: connection.user_role || 'student',
            };
          }
          return connection;
        });

      setConnections(acceptedConnections);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Silently handle errors - don't expose in UI
      setConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  };

  if (!loading && (!user || user.role !== 'mentor')) {
    return <Navigate to="/login/mentor" />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>;
  }

  // Safely format date to prevent "Invalid Date" errors
  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return 'Recently';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Recently'; // Invalid date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mentor Profile */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="ml-4 text-lg font-semibold">Mentor Profile</h2>
            </div>
            <p className="text-gray-600">Manage your name, expertise, and availability</p>
            <Link to="/mentor/profile" className="mt-4 inline-block text-primary-600 hover:text-primary-800 font-medium text-sm">
              Edit Profile →
            </Link>
          </div>

          {/* Connections Card */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow relative">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="ml-4 text-lg font-semibold">Connections</h2>
            </div>
            <p className="text-gray-600">Manage connection requests from students and entrepreneurs</p>
            <Link to="/mentor/connections" className="mt-4 inline-block text-primary-600 hover:text-primary-800 font-medium text-sm">
              View Connections →
            </Link>

            {/* Notification dot for pending connections */}
            <div className="absolute top-4 right-4 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>

          {/* Sessions with Google Calendar Link */}
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="ml-4 text-lg font-semibold">Sessions</h2>
            </div>
            <p className="text-gray-600">Manage your mentoring sessions and schedule</p>
            <a
              href="https://calendar.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-primary-600 hover:text-primary-800 font-medium text-sm"
            >
              Open Google Calendar →
            </a>
          </div>
        </div>

        {/* Mentees Section */}
        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Mentees</h2>

            {loadingConnections ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No active mentees yet</p>
                <p className="text-gray-400 text-sm mb-4">When you accept connection requests, your mentees will appear here</p>
                <Link
                  to="/mentor/connections"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 inline-flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  View Connection Requests
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map(connection => {
                  const menteeData = connection.user || {};
                  const connectionDate = formatDate(connection.created_at);

                  const profilePath = menteeData.role === 'student'
                    ? `/student/profile/${menteeData.id}`
                    : `/entrepreneur/profile/${menteeData.id}`;

                  return (
                    <div key={connection._id || connection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {menteeData.fullName || 'Student'}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">{menteeData.role || 'Student'}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="ml-2 text-sm text-gray-600 truncate">{menteeData.email || 'Contact via platform'}</span>
                        </div>

                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="ml-2 text-sm text-gray-600">Connected on {connectionDate}</span>
                        </div>

                        {menteeData.skills && menteeData.skills.length > 0 && (
                          <div className="flex items-start">
                            <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="ml-2">
                              <span className="text-sm text-gray-600 block mb-1">Skills:</span>
                              <div className="flex flex-wrap gap-1">
                                {menteeData.skills.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                                    {typeof skill === 'object' ? skill.name : skill}
                                  </span>
                                ))}
                                {menteeData.skills.length > 3 && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                    +{menteeData.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Link
                          to={profilePath}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;