import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  BriefcaseIcon, 
  StarIcon, 
  LinkIcon, 
  CheckIcon,
  XIcon,
  PercentIcon
} from 'lucide-react';

const MentorCard = ({ mentor, onRequestConnection, showSimilarityScore, isAlreadyConnected = false }) => {
  const [requestStatus, setRequestStatus] = useState(isAlreadyConnected ? 'success' : 'idle'); 
  
  const similarityScore = mentor.similarity_score;
  
  // Check if this student is already connected with this mentor
  useEffect(() => {
    if (isAlreadyConnected) {
      setRequestStatus('success');
    }
  }, [isAlreadyConnected]);
  
  const handleRequestConnection = async () => {
    // Don't do anything if already connected
    if (isAlreadyConnected || requestStatus === 'success') {
      return;
    }
    
    try {
      setRequestStatus('pending');
      
      // Check if user is logged in
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        alert('Please log in to request a connection with a mentor');
        setRequestStatus('idle');
        return;
      }
      
      
      // If onRequestConnection callback is provided, call it
      if (onRequestConnection) {
        await onRequestConnection(mentor._id || mentor.id);
        setRequestStatus('success');
      } else {
        // Default implementation if no callback provided
        // You would replace this with an actual API call in production
        setTimeout(() => {
          setRequestStatus('success');
        }, 1000);
      }
    } catch (error) {
      console.error('Error requesting connection:', error);
      setRequestStatus('error');
    }
  };
  
  return (
    <div className="card hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start space-x-4">
        {mentor.imageUrl ? (
          <img 
            src={mentor.imageUrl} 
            alt={mentor.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
            <UserIcon className="h-8 w-8" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{mentor.name}</h2>
          <div className="flex items-center mt-1 space-x-3">
            {mentor.rating && (
              <div className="flex items-center text-yellow-500">
                <StarIcon className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm text-gray-600">{mentor.rating}</span>
              </div>
            )}
            
            {showSimilarityScore && similarityScore && (
              <div className="flex items-center text-green-600">
                <PercentIcon className="h-4 w-4" />
                <span className="ml-1 text-sm font-medium">
                  {Math.round(similarityScore * 100)}% match
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm text-gray-600">{mentor.bio}</p>
        
        {mentor.title && (
          <div className="flex items-start space-x-2">
            <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">{mentor.title}</span>
          </div>
        )}
        
        {mentor.expertise && (
          <div className="flex flex-wrap gap-2 pt-2">
            {Array.isArray(mentor.expertise) ? (
              mentor.expertise.slice(0, 4).map((skill, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {mentor.expertise}
              </span>
            )}
            {Array.isArray(mentor.expertise) && mentor.expertise.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                +{mentor.expertise.length - 4} more
              </span>
            )}
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleRequestConnection}
            disabled={requestStatus === 'pending' || requestStatus === 'success'}
            className={`w-full flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              requestStatus === 'success'
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : requestStatus === 'error'
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : requestStatus === 'pending'
                ? 'bg-gray-100 text-gray-800 cursor-wait'
                : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
            }`}
          >
            {requestStatus === 'pending' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : requestStatus === 'success' ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Connected
              </>
            ) : requestStatus === 'error' ? (
              <>
                <XIcon className="h-4 w-4 mr-2" />
                Failed, Try Again
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorCard; 