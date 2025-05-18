// import React, { useEffect, useState } from 'react';
// import { Navigate, Link } from 'react-router-dom';
// import { BookOpen, Users, Briefcase, User, Search, Calendar, MapPin, Clock, FileText, Map } from 'lucide-react';
// import MentorCard from '../../components/MentorCard';
// import { FaUser } from 'react-icons/fa'; // FaUser is an "icon"
// import { mentorAPI } from '../../utils/api';
// import { toast } from 'react-hot-toast';
// import TechMentor from './techmentor';
// import AIMentor from '../../components/dashboard/Chat_assistant';

// function StudentDashboard() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [featuredMentors, setFeaturedMentors] = useState([]);
//   const [recommendedMentors, setRecommendedMentors] = useState([]);
//   const [loadingMentors, setLoadingMentors] = useState(false);
//   const [loadingRecommended, setLoadingRecommended] = useState(false);
//   const [matchError, setMatchError] = useState(null);
//   const [applications, setApplications] = useState([]);
//   const [loadingApplications, setLoadingApplications] = useState(false);
//   const [backendAvailable, setBackendAvailable] = useState(true);

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const parsedUser = JSON.parse(userData);
//       setUser(parsedUser);

//       fetch('http://localhost:5000/health', { method: 'GET' })
//         .then(response => {
//           if (response.ok) {
//             setBackendAvailable(true);
//             fetchMentors();
//             fetchApplications(parsedUser.id);
//             fetchRecommendedMentors(parsedUser.id);
//           } else {
//             setBackendAvailable(false);
//             setLoading(false);
//           }
//         })
//         .catch(err => {
//           console.warn("Backend connection failed:", err);
//           setBackendAvailable(false);
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (user) setLoading(false);
//   }, [user]);

//   const fetchMentors = async () => {
//     try {
//       setLoadingMentors(true);
//       const allMentorsRes = await mentorAPI.getAllMentors();
//       if (allMentorsRes?.data?.length > 0) {
//         const featuredMentors = allMentorsRes.data.slice(0, 3);
//         setFeaturedMentors(featuredMentors);
//       } else {
//         setFeaturedMentors([]);
//       }
//     } catch (err) {
//       console.error('Error fetching mentors:', err);
//       setMatchError("Unable to connect to mentor services");
//       setFeaturedMentors([]);
//     } finally {
//       setLoadingMentors(false);
//     }
//   };

//   const fetchRecommendedMentors = async (studentId) => {
//     try {
//       setLoadingRecommended(true);
//       const response = await fetch("http://localhost:5000/match", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ student_id: studentId })
//       });

//       const data = await response.json();

//       if (response.ok && data.matches) {
//         const mentorDetails = await Promise.all(
//           data.matches.slice(0, 3).map(async match => {
//             const res = await mentorAPI.getMentorById(match.mentor_id);
//             return { ...res.data, similarity_score: match.similarity_score };
//           })
//         );
//         setRecommendedMentors(mentorDetails);
//       } else {
//         console.warn("Matching failed:", data.error);
//         setRecommendedMentors([]);
//       }
//     } catch (err) {
//       console.error("Error fetching recommended mentors:", err);
//       setRecommendedMentors([]);
//     } finally {
//       setLoadingRecommended(false);
//     }
//   };

//   const fetchApplications = async (studentId) => {
//     try {
//       setLoadingApplications(true);
//       const response = await fetch(`http://localhost:5000/student/applications/${studentId}`);
//       if (!response.ok) throw new Error('Failed to fetch applications');
//       const data = await response.json();
//       setApplications(data);
//     } catch (error) {
//       console.error('Error fetching applications:', error);
//       setApplications([]);
//     } finally {
//       setLoadingApplications(false);
//     }
//   };

//   const handleRequestConnection = async (mentorId) => {
//     try {
//       await mentorAPI.requestConnection({
//         mentorId,
//         userId: user.id,
//         userRole: user.role
//       });
//       toast.success('Connection request sent successfully!');
//       return true;
//     } catch (error) {
//       console.error('Error requesting connection:', error);
//       toast.error('Failed to request connection. Please try again.');
//       return false;
//     }
//   };

//   if (!loading && (!user || user.role !== 'student')) {
//     return <Navigate to="/login" />;
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex justify-center items-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {!backendAvailable && (
//           <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
//             <p className="font-bold">Backend Connection Issue</p>
//             <p>We're having trouble connecting to the server. Some features may not work properly.</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//           <DashboardCard icon={BookOpen} title="Learning" description="Access your courses and learning materials" link="/student/learn" />
//           <DashboardCard icon={Users} title="Mentorship" description="Connect with mentors and schedule sessions" link="/mentors" />
//           <DashboardCard icon={Briefcase} title="Opportunities" description="Discover internships and job opportunities" link="/student/opportunities" />
//           <DashboardCard icon={Map} title="Roadmap" description="Get a personalized learning roadmap" link="/student/personalized-roadmap" />
//           <DashboardCard icon={User} title="Profile" description="Update your profile and preferences" link="/student/profile" />
//           </div>
          
//         {/* Featured Mentors */}
//         <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold">Featured Mentors</h2>
//               <Link to="/mentors" className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center">
//                 <Search className="h-4 w-4 mr-1" />
//                 Find More Mentors
//               </Link>
//             </div>
//             {loadingMentors ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
//                 <span className="ml-3 text-gray-600">Loading mentors...</span>
//               </div>
//             ) : featuredMentors.length > 0 ? (
//               <div className="grid grid-cols-1 gap-4">
//                 {featuredMentors.map((mentor, index) => (
//                   <MentorCard
//                     key={index}
//                     mentor={mentor}
//                     onRequestConnection={handleRequestConnection}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-500 mb-4">
//                   {matchError ? matchError : "No mentors available at the moment."}
//                 </p>
//                 <Link to="/mentors" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
//                   Browse All Mentors
//             </Link>
//           </div>
//             )}
//           </div>
//         </div>
        
//         {/* AI-Recommended Mentors */}
//         <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
//             <h2 className="text-xl font-semibold mb-4">AI-Recommended Mentors</h2>
//             {loadingRecommended ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
//                 <span className="ml-3 text-gray-600">Loading recommendations...</span>
//               </div>
//             ) : recommendedMentors.length > 0 ? (
//               <div className="grid grid-cols-1 gap-4">
//                 {recommendedMentors.map((mentor, index) => (
//                   <MentorCard
//                     key={index}
//                     mentor={mentor}
//                     onRequestConnection={handleRequestConnection}
//                     similarityScore={mentor.similarity_score}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-500">No AI-based mentor matches found for your profile.</p>
//               </div>
//             )}
//           </div>
//             </div>

//         {/* Applications */}
//         <div className="mt-8 bg-white shadow rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold">My Applications</h2>
//             <Link to="/student/applications" className="text-primary-600 hover:text-primary-800 font-medium text-sm">
//               View All Applications
//             </Link>
//           </div>
          
//           {loadingApplications ? (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
//               <span className="ml-3 text-gray-600">Loading applications...</span>
//             </div>
//           ) : applications.length > 0 ? (
//             <div className="max-h-80 overflow-y-auto pr-2">
//               <ul className="divide-y divide-gray-200">
//                 {applications.slice(0, 5).map(application => (
//                   <li key={application._id} className="py-4">
//                     <div className="flex justify-between">
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-900">
//                           {application.opportunity?.title || 'Opportunity Title'}
//                         </h3>
//                         <p className="text-xs text-gray-500">
//                           {application.opportunity?.company || 'Company'}
//                         </p>
//                         <div className="mt-1 flex items-center text-xs text-gray-500 flex-wrap gap-2">
//                           {application.opportunity && (
//                             <>
//                               <div className="flex items-center">
//                                 <Briefcase className="mr-1 h-3 w-3 text-gray-400" />
//                                 <p>{application.opportunity.type}</p>
//                               </div>
//                               {application.opportunity.location && (
//                                 <div className="flex items-center">
//                                   <MapPin className="mr-1 h-3 w-3 text-gray-400" />
//                                   <p>{application.opportunity.location}</p>
//                                 </div>
//                               )}
//                             </>
//                           )}
//                           <div className="flex items-center">
//                             <Calendar className="mr-1 h-3 w-3 text-gray-400" />
//                             <p>Applied: {new Date(application.appliedDate).toLocaleDateString()}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <p className="text-gray-500 mb-4">You haven't applied to any opportunities yet.</p>
//               <Link to="/student/opportunities" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
//                 Browse Opportunities
//               </Link>
//           </div>
//           )}
//         </div>
//       </div>
//       <AIMentor />
//     </div>
//   );
// }

// function DashboardCard({  title, description, link }) {
//   return (
//     <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
//       <div className="flex items-center mb-4">
//         <Icon className="text-primary-600 h-6 w-6" />
//         <h2 className="ml-4 text-lg font-semibold">{title}</h2>
//       </div>
//       <p className="text-gray-600">{description}</p>
//       <Link to={link} className="mt-4 text-primary-600 hover:text-primary-800 font-medium text-sm inline-block">
//         {title === 'Learning' ? 'Explore Courses →' :
//          title === 'Mentorship' ? 'Find Mentors →' :
//          title === 'Opportunities' ? 'Browse Opportunities →' :
//          title === 'Roadmap' ? 'Create Roadmap →' :
//          'Edit Profile →'}
//       </Link>
//     </div>
//   );
// }

// export default StudentDashboard; 

import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen, Users, Briefcase, User, Search, Calendar, MapPin, Clock, Map } from 'lucide-react';
import MentorCard from '../../components/MentorCard';
import { FaUser } from 'react-icons/fa';
import { mentorAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import TechMentor from './techmentor';
import AIMentor from '../../components/dashboard/Chat_assistant';

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      fetch('http://localhost:5000/health', { method: 'GET' })
        .then((response) => {
          if (response.ok) {
            setBackendAvailable(true);
            fetchMentors();
            fetchApplications(parsedUser.id);
            fetchRecommendedMentors(parsedUser.id);
          } else {
            setBackendAvailable(false);
            setLoading(false);
            toast.error('Unable to connect to the server. Some features may be unavailable.');
          }
        })
        .catch((err) => {
          console.warn('Backend connection failed:', err);
          setBackendAvailable(false);
          setLoading(false);
          toast.error('Unable to connect to the server. Some features may be unavailable.');
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  const fetchMentors = async () => {
    try {
      setLoadingMentors(true);
      const allMentorsRes = await mentorAPI.getAllMentors();
      if (allMentorsRes?.data?.length > 0) {
        const featuredMentors = allMentorsRes.data.slice(0, 3);
        setFeaturedMentors(featuredMentors);
      } else {
        setFeaturedMentors([]);
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setMatchError('Unable to connect to mentor services');
      setFeaturedMentors([]);
      // toast.error('Failed to load mentors. Pleas
      // e try again later.');
    } finally {
      setLoadingMentors(false);
    }
  };

  const fetchRecommendedMentors = async (studentId) => {
    try {
      setLoadingRecommended(true);
      const response = await fetch('http://localhost:5000/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      const data = await response.json();

      if (response.ok && data.matches) {
        const mentorDetails = await Promise.all(
          data.matches.slice(0, 3).map(async (match) => {
            const res = await mentorAPI.getMentorById(match.mentor_id);
            return { ...res.data, similarity_score: match.similarity_score };
          })
        );
        setRecommendedMentors(mentorDetails);
      } else {
        console.warn('Matching failed:', data.error);
        setRecommendedMentors([]);
        toast.error('No mentor matches found.');
      }
    } catch (err) {
      console.error('Error fetching recommended mentors:', err);
      setRecommendedMentors([]);
      // toast.error('Failed to load recommended mentors. Please try again later.');
    } finally {
      setLoadingRecommended(false);
    }
  };

  const fetchApplications = async (studentId) => {
    try {
      setLoadingApplications(true);
      const response = await fetch(`http://localhost:5000/student/applications/${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      // toast.error('Failed to load applications. Please try again later.');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleRequestConnection = async (mentorId) => {
    try {
      await mentorAPI.requestConnection({
        mentorId,
        userId: user.id,
        userRole: user.role,
      });
      toast.success('Connection request sent successfully!');
      return true;
    } catch (error) {
      console.error('Error requesting connection:', error);
      toast.error('Failed to request connection. Please try again.');
      return false;
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!backendAvailable && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p className="font-bold">Backend Connection Issue</p>
            <p>We're having trouble connecting to the server. Some features may not work properly.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <DashboardCard icon={BookOpen} title="Learning" description="Access your courses and learning materials" link="/student/learn" />
          <DashboardCard icon={Users} title="Mentorship" description="Connect with mentors and schedule sessions" link="/mentors" />
          <DashboardCard icon={Briefcase} title="Opportunities" description="Discover internships and job opportunities" link="/student/opportunities" />
          <DashboardCard icon={Map} title="Roadmap" description="Get a personalized learning roadmap" link="/student/personalized-roadmap" />
          <DashboardCard icon={User} title="Profile" description="Update your profile and preferences" link="/student/profile" />
        </div>

        {/* Featured Mentors */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold"> Mentors handpicked for you!</h2>
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
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">{matchError ? matchError : 'No mentors available at the moment.'}</p>
                <Link
                  to="/mentors"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Browse All Mentors
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* AI-Recommended Mentors */}
        {/* <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI-Recommended Mentors</h2>
            {loadingRecommended ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading recommendations...</span>
              </div>
            ) : recommendedMentors.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recommendedMentors.map((mentor, index) => (
                  <MentorCard
                    key={index}
                    mentor={mentor}
                    onRequestConnection={handleRequestConnection}
                    similarityScore={mentor.similarity_score}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No AI-based mentor matches found for your profile.</p>
              </div>
        //     )} */}
        {/* //   </div> */}
        {/* // </div> */}

        {/* Applications */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Applications</h2>
            <Link to="/student/applications" className="text-primary-600 hover:text-primary-800 font-medium text-sm">
              View All Applications
            </Link>
          </div>

          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading applications...</span>
            </div>
          ) : applications.length > 0 ? (
            <div className="max-h-80 overflow-y-auto pr-2">
              <ul className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((application) => (
                  <li key={application._id} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {application.opportunity?.title || 'Opportunity Title'}
                        </h3>
                        <p className="text-xs text-gray-500">{application.opportunity?.company || 'Company'}</p>
                        <div className="mt-1 flex items-center text-xs text-gray-500 flex-wrap gap-2">
                          {application.opportunity && (
                            <>
                              <div className="flex items-center">
                                <Briefcase className="mr-1 h-3 w-3 text-gray-400" />
                                <p>{application.opportunity.type}</p>
                              </div>
                              {application.opportunity.location && (
                                <div className="flex items-center">
                                  <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                                  <p>{application.opportunity.location}</p>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                            <p>Applied: {new Date(application.appliedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't applied to any opportunities yet.</p>
              <Link
                to="/student/opportunities"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Browse Opportunities
              </Link>
            </div>
          )}
        </div>
      </div>
      <AIMentor />
    </div>
  );
}

function DashboardCard({ icon: Icon, title, description, link }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <Icon className="text-primary-600 h-6 w-6" />
        <h2 className="ml-4 text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-gray-600">{description}</p>
      <Link to={link} className="mt-4 text-primary-600 hover:text-primary-800 font-medium text-sm inline-block">
        {title === 'Learning'
          ? 'Explore Courses →'
          : title === 'Mentorship'
          ? 'Find Mentors →'
          : title === 'Opportunities'
          ? 'Browse Opportunities →'
          : title === 'Roadmap'
          ? 'Create Roadmap →'
          : 'Edit Profile →'}
      </Link>
    </div>
  );
}

export default StudentDashboard;