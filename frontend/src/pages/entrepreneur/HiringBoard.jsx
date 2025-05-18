import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { PlusCircle, Edit2, Trash2, Users, Clock, MapPin, Briefcase } from 'lucide-react';

function HiringBoard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    type: 'Internship',
    skills: '',
    description: '',
    duration: '',
    location: 'Remote',
    stipend: '',
    requirements: '',
    responsibilities: ''
  });
  const [apiError, setApiError] = useState('');
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
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userData);
        console.log("User data:", user);
        
        if (user && user.id) {
          const response = await fetch(`http://localhost:5000/entrepreneur/opportunities/${user.id}`);
          
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
            throw new Error(data.error || 'Failed to fetch opportunities');
          }
          
          setOpportunities(data);
        } else {
          throw new Error('User ID not found');
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setApiError('Failed to load opportunities. ' + error.message);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOpportunities();
  }, []);

  
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOpportunity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setDebugInfo(null);
    
    const processedSkills = newOpportunity.skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
    
    const processedRequirements = newOpportunity.requirements
      ? newOpportunity.requirements.split('\n').filter(req => req.trim() !== '')
      : [];
    
    const processedResponsibilities = newOpportunity.responsibilities
      ? newOpportunity.responsibilities.split('\n').filter(resp => resp.trim() !== '')
      : [];
    
    const opportunityData = {
      ...newOpportunity,
      skills: processedSkills,
      requirements: processedRequirements,
      responsibilities: processedResponsibilities,
      company: user.company || 'Company Name',
      entrepreneurId: user.id
    };
    
    // Remove id for new opportunities
    if (!newOpportunity._id) {
      delete opportunityData._id;
    }
    
    try {
      console.log("Sending data:", opportunityData);
      
      const url = newOpportunity._id ? 
        `http://localhost:5000/entrepreneur/opportunities/${user.id}/${newOpportunity._id}` : 
        `http://localhost:5000/entrepreneur/opportunities/${user.id}`;
      const method = newOpportunity._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(opportunityData)
      });
      
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
        throw new Error(data.error || 'Failed to save opportunity');
      }
      
      // Update local state
      if (newOpportunity._id) {
        // Update existing opportunity
        setOpportunities(opportunities.map(opp => 
          opp._id === newOpportunity._id ? data : opp
        ));
      } else {
        // Add new opportunity
        setOpportunities([data, ...opportunities]);
      }
      
      // Reset form
      setNewOpportunity({
        title: '',
        type: 'Internship',
        skills: '',
        description: '',
        duration: '',
        location: 'Remote',
        stipend: '',
        requirements: '',
        responsibilities: ''
      });
      
      // Close modal
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setApiError('Failed to save opportunity. ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/entrepreneur/opportunities/${user.id}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete opportunity');
      }
      
      // Update local state
      const updatedOpportunities = opportunities.filter(opp => opp._id !== id);
      setOpportunities(updatedOpportunities);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      setApiError('Failed to delete opportunity. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hiring Board</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Post Opportunity
          </button>
        </div>
        
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
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
        
        {opportunities.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No opportunities posted yet</h2>
            <p className="text-gray-500 mb-6">Create your first job opportunity to find talented students for your startup.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Post Your First Opportunity
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {opportunities.map(opportunity => (
                <li key={opportunity._id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{opportunity.title}</h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-3">
                          <div className="flex items-center">
                            <Briefcase className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{opportunity.type}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{opportunity.duration}</p>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{opportunity.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Link 
                          to={`/entrepreneur/hiring-board/${user.id}/${opportunity._id}/applicants`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {opportunity.applicants > 0 ? `${opportunity.applicants} Applicants` : 'No Applicants'}
                        </Link>
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          onClick={() => {
                            // Set form data and open modal for editing
                            setNewOpportunity({
                              ...opportunity,
                              skills: opportunity.skills.join(', '),
                              requirements: opportunity.requirements ? opportunity.requirements.join('\n') : '',
                              responsibilities: opportunity.responsibilities ? opportunity.responsibilities.join('\n') : ''
                            });
                            setShowCreateModal(true);
                          }}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          onClick={() => handleDelete(opportunity._id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
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
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Posted on {new Date(opportunity.postedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Create/Edit Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {newOpportunity._id ? 'Edit Opportunity' : 'Post New Opportunity'}
              </h3>
            </div>
            
            {apiError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
            
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Role Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={newOpportunity.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Role Type</label>
                <select
                  id="type"
                  name="type"
                  required
                  value={newOpportunity.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="PoC">Proof of Concept (PoC)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  required
                  value={newOpportunity.skills}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="React, JavaScript, CSS"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={newOpportunity.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">Requirements (one per line)</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={newOpportunity.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Bachelor's degree in Computer Science&#10;Experience with React&#10;Strong communication skills"
                />
              </div>
              
              <div>
                <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">Responsibilities (one per line)</label>
                <textarea
                  id="responsibilities"
                  name="responsibilities"
                  value={newOpportunity.responsibilities}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Develop user interfaces&#10;Implement features and functionality&#10;Debug and fix issues"
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  required
                  value={newOpportunity.duration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="3 months"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <select
                  id="location"
                  name="location"
                  required
                  value={newOpportunity.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="stipend" className="block text-sm font-medium text-gray-700">
                  Stipend (optional)
                </label>
                <input
                  type="text"
                  id="stipend"
                  name="stipend"
                  value={newOpportunity.stipend}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="₹10,000/month"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                >
                  {newOpportunity._id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HiringBoard; 