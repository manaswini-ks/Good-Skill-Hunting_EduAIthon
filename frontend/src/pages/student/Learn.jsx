import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, BookOpen, Video, FileText, Wrench, X, BookmarkPlus, ExternalLink, Clock } from 'lucide-react';

// Learning resource types with their icons
const resourceTypes = {
  video: { name: 'Video', icon: <Video className="h-4 w-4" /> },
  article: { name: 'Article', icon: <FileText className="h-4 w-4" /> },
  tool: { name: 'Tool', icon: <Wrench className="h-4 w-4" /> },
  pdf: { name: 'PDF', icon: <FileText className="h-4 w-4" /> }
};

// Tracks available for filtering
const tracks = [
  'All Tracks',
  'Web Development',
  'Mobile Development',
  'AI/ML',
  'Product Management',
  'Design',
  'Career'
];

function Learn() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All Tracks');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedResources, setSavedResources] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Initialize resources from localStorage or use sample data if not available
    const storedResources = JSON.parse(localStorage.getItem('learning_resources') || '[]');
    if (storedResources.length > 0) {
      setResources(storedResources);
    } else {
      // Sample learning resources
      const sampleResources = [
        {
          id: '1',
          title: 'Introduction to React Hooks',
          description: 'Learn how to use React Hooks to simplify your components and manage state effectively.',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=dpw9EHDh2bM',
          track: 'Web Development',
          tags: ['React', 'JavaScript', 'Frontend'],
          dateAdded: '2023-05-10'
        },
        {
          id: '2',
          title: 'Building RESTful APIs with Node.js',
          description: 'A comprehensive guide to creating robust and scalable APIs using Node.js and Express.',
          type: 'article',
          url: 'https://www.freecodecamp.org/news/build-a-restful-api-using-node-express-and-mongodb/',
          track: 'Web Development',
          tags: ['Node.js', 'API', 'Backend'],
          dateAdded: '2023-05-15'
        },
        {
          id: '3',
          title: 'Machine Learning for Beginners',
          description: 'Start your journey in AI and machine learning with this comprehensive introductory course.',
          type: 'video',
          url: 'https://www.coursera.org/learn/machine-learning',
          track: 'AI/ML',
          tags: ['Python', 'ML', 'AI'],
          dateAdded: '2023-06-01'
        },
        {
          id: '4',
          title: 'UI Design Principles',
          description: 'Learn essential UI design principles and best practices for creating beautiful interfaces.',
          type: 'article',
          url: 'https://www.smashingmagazine.com/2018/01/universal-principles-ux-design/',
          track: 'Design',
          tags: ['UI', 'UX', 'Design'],
          dateAdded: '2023-06-12'
        },
        {
          id: '5',
          title: 'Git & GitHub Crash Course',
          description: 'Master the basics of Git and GitHub for version control and collaboration.',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
          track: 'Web Development',
          tags: ['Git', 'GitHub', 'Version Control'],
          dateAdded: '2023-06-20'
        },
        {
          id: '6',
          title: 'Product Management Fundamentals',
          description: 'Learn the core concepts and methodologies of effective product management.',
          type: 'pdf',
          url: 'https://example.com/product-management-guide.pdf',
          track: 'Product Management',
          tags: ['Product', 'Management', 'Strategy'],
          dateAdded: '2023-07-05'
        },
        {
          id: '7',
          title: 'Flutter Mobile App Development',
          description: 'Build beautiful cross-platform mobile apps with Flutter framework and Dart language.',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=1gDhl4leEzA',
          track: 'Mobile Development',
          tags: ['Flutter', 'Dart', 'Mobile'],
          dateAdded: '2023-07-15'
        },
        {
          id: '8',
          title: 'Resume Building and Interview Tips',
          description: 'Expert advice on crafting an effective resume and acing technical interviews.',
          type: 'article',
          url: 'https://www.indeed.com/career-advice/resumes-cover-letters/how-to-write-a-resume',
          track: 'Career',
          tags: ['Resume', 'Interview', 'Career'],
          dateAdded: '2023-07-22'
        },
        {
          id: '9',
          title: 'Essential Developer Tools',
          description: 'A collection of must-have tools and extensions for modern software development.',
          type: 'tool',
          url: 'https://github.com/sdmg15/Best-websites-a-programmer-should-visit',
          track: 'Web Development',
          tags: ['Tools', 'Productivity', 'Development'],
          dateAdded: '2023-08-01'
        },
        {
          id: '10',
          title: 'Data Structures and Algorithms',
          description: 'Master the fundamental data structures and algorithms required for technical interviews.',
          type: 'pdf',
          url: 'https://example.com/dsa-guide.pdf',
          track: 'Career',
          tags: ['DSA', 'Algorithms', 'Interviews'],
          dateAdded: '2023-08-10'
        },
      ];
      
      setResources(sampleResources);
      localStorage.setItem('learning_resources', JSON.stringify(sampleResources));
    }
    
    // Get saved and recently viewed resources
    const savedItems = JSON.parse(localStorage.getItem(`saved_resources_${user?.id}`) || '[]');
    setSavedResources(savedItems);
    
    const recentItems = JSON.parse(localStorage.getItem(`recently_viewed_${user?.id}`) || '[]');
    setRecentlyViewed(recentItems);
    
    setLoading(false);
  }, []);

  // Apply filters whenever filters or resources change
  useEffect(() => {
    let result = [...resources];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(resource => 
        resource.title.toLowerCase().includes(term) || 
        resource.description.toLowerCase().includes(term) ||
        resource.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply track filter
    if (selectedTrack !== 'All Tracks') {
      result = result.filter(resource => resource.track === selectedTrack);
    }
    
    // Apply type filter
    if (selectedTypes.length > 0) {
      result = result.filter(resource => selectedTypes.includes(resource.type));
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(resource => 
        selectedTags.some(tag => resource.tags.includes(tag))
      );
    }
    
    // Sort by most recently added
    result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    setFilteredResources(result);
  }, [searchTerm, selectedTrack, selectedTypes, selectedTags, resources]);

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

  // Get all unique tags from resources
  const allTags = [...new Set(resources.flatMap(resource => resource.tags))].sort();

  // Handle saving a resource
  const handleSaveResource = (resourceId) => {
    const isAlreadySaved = savedResources.includes(resourceId);
    
    let updatedSaved;
    if (isAlreadySaved) {
      updatedSaved = savedResources.filter(id => id !== resourceId);
    } else {
      updatedSaved = [...savedResources, resourceId];
    }
    
    setSavedResources(updatedSaved);
    localStorage.setItem(`saved_resources_${user.id}`, JSON.stringify(updatedSaved));
  };

  // Handle opening a resource
  const handleOpenResource = (resource) => {
    // Add to recently viewed if not already there
    let updatedRecent = [resource.id, ...recentlyViewed.filter(id => id !== resource.id)].slice(0, 5);
    setRecentlyViewed(updatedRecent);
    localStorage.setItem(`recently_viewed_${user.id}`, JSON.stringify(updatedRecent));
    
    // Open the URL in a new tab
    window.open(resource.url, '_blank');
  };

  // Toggle a type filter
  const toggleTypeFilter = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Toggle a tag filter
  const toggleTagFilter = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Learning Resources</h1>
          <p className="mt-2 text-gray-600">
            Find curated videos, tutorials, articles and more based on your interest.
          </p>
        </div>
        
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary-600" />
              Recently Viewed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentlyViewed.slice(0, 3).map(resourceId => {
                const resource = resources.find(r => r.id === resourceId);
                if (!resource) return null;
                
                return (
                  <div 
                    key={resource.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenResource(resource)}
                  >
                    <h3 className="text-md font-medium text-gray-900 line-clamp-1">{resource.title}</h3>
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {resourceTypes[resource.type].icon}
                        <span className="ml-1">{resourceTypes[resource.type].name}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="md:flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Track Filter */}
            <div className="md:w-64">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
              >
                {tracks.map(track => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Type Filters */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Resource Type</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(resourceTypes).map(([type, { name, icon }]) => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    ${selectedTypes.includes(type) 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  <span className="mr-1">{icon}</span>
                  {name}
                  {selectedTypes.includes(type) && (
                    <X className="h-4 w-4 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tag Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    ${selectedTags.includes(tag) 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="h-4 w-4 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Resource Listings */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary-600" />
              Learning Resources
            </h2>
            <p className="text-sm text-gray-500">
              {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
            </p>
          </div>
          
          {filteredResources.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h2>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <div key={resource.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{resource.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveResource(resource.id);
                        }}
                        className={`p-1 rounded-full ${
                          savedResources.includes(resource.id) 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        <BookmarkPlus className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {resourceTypes[resource.type].icon}
                        <span className="ml-1">{resourceTypes[resource.type].name}</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {resource.track}
                      </span>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{resource.description}</p>
                    
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleOpenResource(resource)}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Resource
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Learn; 