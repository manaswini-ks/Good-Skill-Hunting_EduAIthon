import React, { useState, useEffect } from 'react';
import MentorCard from '../components/MentorCard';
import { mentorAPI } from '../utils/api';
import { toast } from 'react-hot-toast'; // Assume toast library is installed

// Fallback data if API fails
const fallbackMentors = [
  {
    name: 'Sarah Rodriguez',
    bio: '15+ years experience in scaling tech startups. Specialized in product strategy and go-to-market execution.',
    availability: 'Weekdays 2-6 PM EST',
    successStories: 'Helped 3 startups secure Series A funding. Mentored 20+ entrepreneurs in product strategy.',
    expertise: ['Product Strategy', 'Go-to-Market', 'Funding'],
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'James Smith',
    bio: '10+ years in EdTech and AI startups. Expert in innovation and product development.',
    availability: 'Weekends 10 AM - 4 PM IST',
    successStories: 'Supported 15+ students in launching AI-driven tools and secured incubation offers.',
    expertise: ['AI', 'EdTech', 'Product Development'],
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Aisha Khan',
    bio: 'Serial entrepreneur with expertise in SaaS and marketplace startups. Focus on growth and scaling.',
    availability: 'Tuesdays and Thursdays, 9 AM - 12 PM GMT',
    successStories: 'Founded 3 successful startups with 2 exits. Mentored over 30 early-stage founders.',
    expertise: ['SaaS', 'Growth Strategy', 'Fundraising'],
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Michael Chen',
    bio: 'Technical leader with background in scaling engineering teams at Fortune 500 companies and startups.',
    availability: 'Mondays and Fridays, 6 PM - 9 PM PST',
    successStories: 'Helped 10+ startups build scalable architecture. Mentored 25+ engineers to leadership roles.',
    expertise: ['Engineering Leadership', 'System Architecture', 'Team Building'],
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

const MentorSelect = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [userConnections, setUserConnections] = useState([]);

  // All possible expertise areas from mentors
  const expertiseAreas = [...new Set(
    fallbackMentors.flatMap(mentor => mentor.expertise || [])
  )].sort();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all mentors
        const mentorResponse = await mentorAPI.getAllMentors();
        setMentors(mentorResponse.data);
        
        // Fetch user's existing connections
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          try {
            const connectionsResponse = await mentorAPI.getUserConnections(user.id, user.role);
            setUserConnections(connectionsResponse.data || []);
          } catch (connErr) {
            console.error('Error fetching connections:', connErr);
            setUserConnections([]);
          }
        }
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors. Using demo data instead.');
        setMentors(fallbackMentors);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if the user is already connected with a mentor
  const isConnectedWithMentor = (mentorId) => {
    return userConnections.some(conn => 
      (conn.mentor_id === mentorId || conn.mentor?._id === mentorId) && 
      ['pending', 'accepted'].includes(conn.status)
    );
  };

  // Filter mentors based on search term and selected expertise
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchTerm === '' || 
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = selectedExpertise === '' ||
      (mentor.expertise && Array.isArray(mentor.expertise) && mentor.expertise.includes(selectedExpertise));
    
    return matchesSearch && matchesExpertise;
  });

  const handleRequestConnection = async (mentorId) => {
    try {
      // Get user ID from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error('Please log in to request a connection');
        return;
      }
      
      // Make API call to request connection
      const response = await mentorAPI.requestConnection({
        mentorId,
        userId: user.id,
        userRole: user.role
      });
      
      // Update local connections state to reflect the new connection
      setUserConnections([...userConnections, {
        mentor_id: mentorId,
        status: 'pending'
      }]);
      
      toast.success('Connection request sent successfully!');
      return response.data;
    } catch (error) {
      console.error('Error requesting connection:', error);
      toast.error(error.response?.data?.error || 'Failed to request connection');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Find Your Perfect Mentor</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with industry experts who can guide you through your educational and entrepreneurial journey.
          </p>
        </div>

        {/* Search and filter */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search mentors</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="input pl-10"
                  placeholder="Search by name or expertise"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label htmlFor="expertise" className="sr-only">Filter by expertise</label>
              <select
                id="expertise"
                name="expertise"
                className="input"
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
              >
                <option value="">All Expertise Areas</option>
                {expertiseAreas.map((expertise) => (
                  <option key={expertise} value={expertise}>{expertise}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No mentors found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor, index) => (
              <MentorCard 
                key={index}
                mentor={mentor}
                onRequestConnection={handleRequestConnection}
                isAlreadyConnected={isConnectedWithMentor(mentor._id || mentor.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSelect; 