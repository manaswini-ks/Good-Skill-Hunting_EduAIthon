import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { mentorAPI, studentAPI, entrepreneurAPI } from '../../utils/api';
import { 
  UserIcon, 
  CheckIcon, 
  XIcon, 
  MailIcon, 
  CalendarIcon,
  ClockIcon,
  UserCheckIcon,
  UserXIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MentorConnections = () => {
  const [pendingConnections, setPendingConnections] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [rejectedConnections, setRejectedConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mentorId = localStorage.getItem('mentor_id');

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMentorConnections(mentorId);
      
      // Group connections by status
      const pending = [];
      const accepted = [];
      const rejected = [];

      response.data.forEach(conn => {
        if (conn.status === 'pending') pending.push(conn);
        else if (conn.status === 'accepted') accepted.push(conn);
        else if (conn.status === 'rejected') rejected.push(conn);
      });

      setPendingConnections(pending);
      setAcceptedConnections(accepted);
      setRejectedConnections(rejected);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to load connection requests.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mentorId) {
      setError('You must be logged in as a mentor to view this page.');
      setLoading(false);
      return;
    }

    fetchConnections();
  }, [mentorId]);

  const handleUpdateStatus = async (connectionId, newStatus) => {
    try {
      // Extract the actual ID to use (might be in _id or id property)
      const actualId = connectionId || '';
      
      // Show loading toast
      toast.loading(`Updating connection status...`, { id: 'connection-status' });
      
      await mentorAPI.updateConnectionStatus(actualId, newStatus);
      
      // Update the toast to success
      toast.success(`Connection ${newStatus} successfully!`, { id: 'connection-status' });
      
      // Move the connection to the appropriate list
      const updatedPending = pendingConnections.filter(conn => {
        // Check both _id and id properties
        const connId = conn._id || conn.id;
        return connId !== actualId;
      });
      setPendingConnections(updatedPending);

      const connToUpdate = pendingConnections.find(conn => {
        // Check both _id and id properties
        const connId = conn._id || conn.id;
        return connId === actualId;
      });
      
      if (connToUpdate) {
        const updatedConn = { ...connToUpdate, status: newStatus };
        
        if (newStatus === 'accepted') {
          setAcceptedConnections([...acceptedConnections, updatedConn]);
        } else if (newStatus === 'rejected') {
          setRejectedConnections([...rejectedConnections, updatedConn]);
        }
      }
    } catch (err) {
      console.error(`Error ${newStatus} connection:`, err);
      
      // More detailed error handling
      let errorMessage = `Failed to ${newStatus} connection. Please try again.`;
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data?.error || errorMessage;
        console.error('Server response:', err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Check your connection.';
      }
      
      toast.error(errorMessage, { id: 'connection-status' });
      
      // Refresh connections to ensure UI is in sync with backend
      fetchConnections();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchConnections}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Connection Requests</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Pending Requests
            {pendingConnections.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2">
                {pendingConnections.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <UserCheckIcon className="h-4 w-4" />
            Connected Students
            {acceptedConnections.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2">
                {acceptedConnections.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <UserXIcon className="h-4 w-4" />
            Rejected Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingConnections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No pending connection requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingConnections.map((connection) => (
                <ConnectionCard
                  key={connection._id || connection.id || `pending-${connection.created_at}`}
                  connection={connection}
                  onAccept={() => handleUpdateStatus(connection._id || connection.id, 'accepted')}
                  onReject={() => handleUpdateStatus(connection._id || connection.id, 'rejected')}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted">
          {acceptedConnections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No connected students yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {acceptedConnections.map((connection) => (
                <ConnectionCard
                  key={connection._id || connection.id || `accepted-${connection.created_at}`}
                  connection={connection}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedConnections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No rejected connection requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rejectedConnections.map((connection) => (
                <ConnectionCard
                  key={connection._id || connection.id || `rejected-${connection.created_at}`}
                  connection={connection}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ConnectionCard = ({ connection, onAccept, onReject, showActions }) => {
  const user = connection.user || {};
  const formattedDate = connection.created_at 
    ? new Date(connection.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown date';
  
  // Determine profile path based on user role
  const getProfilePath = () => {
    if (user.role === 'student') {
      return `/student/profile/${user.id || user._id}`;
    } else if (user.role === 'entrepreneur') {
      return `/entrepreneur/profile/${user.id || user._id}`;
    }
    return '#';
  };
  
  return (
    <div className="card hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start space-x-4">
        {user.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={user.fullName || 'User'}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700">
            <UserIcon className="h-8 w-8" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {user.fullName || 'Unknown User'}
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            {user.role === 'student' ? 'Student' : 'Entrepreneur'}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {connection.message && (
          <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-md border border-gray-100">
            "{connection.message}"
          </p>
        )}
        
        <div className="flex items-start space-x-2">
          <MailIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600">{user.email || 'No email provided'}</span>
        </div>
        
        <div className="flex items-start space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600">Requested on {formattedDate}</span>
        </div>

        {showActions && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 transition duration-300"
            >
              <CheckIcon className="h-4 w-4" />
              Accept
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-300"
            >
              <XIcon className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}
        
        {!showActions && connection.status === 'accepted' && (
          <div className="pt-4">
            <Link 
              to={getProfilePath()}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition duration-300"
            >
              <ExternalLinkIcon className="h-4 w-4" />
              View Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorConnections; 