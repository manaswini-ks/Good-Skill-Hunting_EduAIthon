import React, { useState, useEffect } from 'react';
import {  useParams, Link } from 'react-router-dom';
import { BookOpen, Code, ExternalLink, FileText, Globe } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const currentUserId = localStorage.getItem('student_id');
  const userId = id || currentUserId;
  const isOwnProfile = !id || id === currentUserId;
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No student ID found. Please log in again.');
      return;
    }

    console.log('Fetching student profile for ID:', userId);

    fetch(`http://localhost:5000/student/profile/${userId}`)
  .then(res => {
        console.log('Profile response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
    return res.json();
  })
      .then(data => {
        console.log('Profile data received:', data);
        setProfile(data);
        const formData = {
          ...data,
          skills: data.skills?.map(s => s.name).join(', ') || '',
          achievements: Array.isArray(data.achievements) ? data.achievements.join(';') : (data.achievements || '')
        };
        setForm(formData);
        setProfileId(data._id);
        setLoading(false);
        setError(null);
        
        // After profile is fetched, fetch projects for this student
        fetchProjects(userId);
  })
  .catch(err => {
    console.error("Fetch error:", err);
    setLoading(false);
        setError(err.message);
      });
  }, [userId]);
  
  const fetchProjects = (studentId) => {
    setProjectsLoading(true);
    fetch(`http://localhost:5000/student/projects/${studentId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProjects(data || []);
        setProjectsLoading(false);
      })
      .catch(err => {
        console.error("Projects fetch error:", err);
        setProjectsLoading(false);
        setProjects([]);
  });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
    const payload = {
      ...form,
        tags: form.tags?.split(',').map(t => t.trim()) || [],
        achievements: form.achievements?.split(';').map(t => t.trim()) || [],
        skills: form.skills?.split(',').map(s => ({ 
          name: s.trim(), 
          level: 'Intermediate' 
        })) || [],
      education: {
        current: form.education?.current || '',
          past: form.education?.past?.split(';').map(e => e.trim()) || [],
      },
      socials: {
        linkedin: form.socials?.linkedin || '',
        portfolio: form.socials?.portfolio || '',
      },
    };

      console.log('Saving profile with payload:', payload);

    const method = profileId ? 'PUT' : 'POST';
    const url = profileId
        ? `http://localhost:5000/student/profile/${profileId}`
        : `http://localhost:5000/student/profile/${userId}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to save profile: ${res.status}`);

      const updated = await res.json();
      console.log('Profile updated:', updated);

      setProfile(updated);
      setForm({
        ...updated,
        skills: updated.skills?.map(s => s.name).join(', ') || '',
        achievements: Array.isArray(updated.achievements) ? updated.achievements.join(';') : (updated.achievements || '')
      });
      setProfileId(updated._id);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-50 to-primary-100">
      <div className="text-center py-6 text-gray-600 animate-pulse font-medium">
        <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl p-6 text-white">
          <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Profile' : 'Student Profile'}</h1>
            {isOwnProfile && (
              <div className="flex gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 font-medium shadow-md"
        >
          {isEditing ? 'Cancel' : profile ? 'Edit' : 'Create'}
        </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 font-medium shadow-md"
                  >
                    Save
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-t shadow-md">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-b-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Projects Section - Now on the left */}
          <div className="md:col-span-7 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
              {isOwnProfile && (
                <Link 
                  to="/student/projects" 
                  className="text-primary-600 hover:text-primary-800 font-medium flex items-center text-sm"
                >
                  <Code className="h-4 w-4 mr-1" /> 
                  Manage Projects
                </Link>
              )}
            </div>
            
            {projectsLoading ? (
              <div className="flex justify-center items-center h-32">
                <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                <Code className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {isOwnProfile ? 
                    "Showcase your skills by adding projects to your portfolio." : 
                    "This student hasn't added any projects yet."}
                </p>
                {isOwnProfile && (
                  <Link 
                    to="/student/projects" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add Your First Project
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {project.image_url && (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      
                      {/* Tech Stack */}
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack.map((tech, idx) => (
                              <span 
                                key={idx} 
                                className="bg-blue-50 text-blue-700 px-2 py-1 text-xs rounded-full"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Links */}
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                        {project.github_url && (
                          <a 
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-primary-600 flex items-center text-sm"
                          >
                            <GitHub className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        )}
                        
                        {project.live_url && (
                          <a 
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-green-600 flex items-center text-sm"
                          >
                            <Globe className="h-4 w-4 mr-1" />
                            Live Demo
                          </a>
                        )}
                        
                        {project.documentation_url && (
                          <a 
                            href={project.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-purple-600 flex items-center text-sm"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Documentation
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {projects.length > 3 && (
                  <div className="text-center pt-2">
                    <Link
                      to={isOwnProfile ? "/student/projects" : `#`}
                      className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                    >
                      View All Projects ({projects.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
      </div>

          {/* Profile Section - Now on the right */}
          <div className="md:col-span-5 p-6 bg-gray-50 border-l border-gray-200">
      {isEditing ? (
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            name="fullName"
            value={form.fullName || ''}
            onChange={handleChange}
            placeholder="Full Name"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            value={form.email || ''}
            onChange={handleChange}
            placeholder="Email"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            name="location"
            value={form.location || ''}
            onChange={handleChange}
            placeholder="Location"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            name="tags"
            value={form.tags || ''}
            onChange={handleChange}
            placeholder="Tags (comma-separated)"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Education</label>
          <input
            name="education.current"
            value={form.education?.current || ''}
            onChange={e => setForm(prev => ({
              ...prev,
              education: { ...prev.education, current: e.target.value }
            }))}
            placeholder="Current Education"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Past Education (separated by ;)</label>
          <input
            name="education.past"
            value={form.education?.past?.join(';') || ''}
            onChange={e => setForm(prev => ({
              ...prev,
              education: { ...prev.education, past: e.target.value.split(';') }
            }))}
            placeholder="Past Education (separated by ;)"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
          <input
            name="skills"
                  value={form.skills || ''}
            onChange={handleChange}
            placeholder="Skills (comma-separated)"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (separated by ;)</label>
          <input
            name="achievements"
                  value={form.achievements || ''}
            onChange={handleChange}
            placeholder="Achievements (separated by ;)"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume Link</label>
          <input
            name="resumeLink"
            value={form.resumeLink || ''}
            onChange={handleChange}
            placeholder="Resume Link"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>
              
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <input
            name="socials.linkedin"
            value={form.socials?.linkedin || ''}
            onChange={e => setForm(prev => ({
              ...prev,
              socials: { ...prev.socials, linkedin: e.target.value }
            }))}
            placeholder="LinkedIn"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
          <input
            name="socials.portfolio"
            value={form.socials?.portfolio || ''}
            onChange={e => setForm(prev => ({
              ...prev,
              socials: { ...prev.socials, portfolio: e.target.value }
            }))}
            placeholder="Portfolio"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
          />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={handleSave}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium transition duration-300 shadow-md hover:shadow-lg"
          >
                  Save Profile
          </button>
              </div>
        </form>
      ) : (
            <div className="space-y-6">
              {!profile ? (
                <div className="text-center py-16">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="text-gray-500 mb-6 text-lg">No profile found. Click 'Create' to set up your profile.</div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium transition duration-300 shadow-md hover:shadow-lg"
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 mb-4 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.fullName?.charAt(0) || "S"}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{profile.fullName}</h2>
                    <p className="text-gray-600 text-sm">{profile.email}</p>
                    <p className="text-gray-600 mt-1 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location || "Location not specified"}
                    </p>
                  </div>
                    
                  <div className="space-y-6">
                    {/* Tags */}
                    {profile.tags?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.tags?.map((tag, index) => (
                            <span key={index} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Education */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Education</h3>
                      <div className="mb-2">
                        <p className="text-gray-800 font-medium">{profile.education?.current}</p>
                      </div>
                      
                      {profile.education?.past?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Past Education</p>
                          <ul className="list-disc pl-4 text-sm text-gray-600">
                            {profile.education?.past?.map((edu, index) => (
                              <li key={index}>{edu}</li>
                            ))}
          </ul>
        </div>
      )}
                    </div>
                    
                    {/* Skills */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills?.map((skill, index) => (
                          <span key={index} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg border border-primary-200">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Achievements */}
                    {profile.achievements?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Achievements</h3>
                        <ul className="list-disc pl-4 text-sm text-gray-600">
                          {profile.achievements?.map((achievement, index) => (
                            <li key={index} className="mb-1">{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Social Links */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Connect</h3>
                      <div className="flex space-x-4">
                        {profile.socials?.linkedin && (
                          <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600 transition duration-300">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                        {profile.socials?.portfolio && (
                          <a href={profile.socials.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600 transition duration-300">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                              <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                          </a>
                        )}
                      </div>
                      
                      {profile.resumeLink && (
                        <div className="mt-4 w-full">
                          <a 
                            href={profile.resumeLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium p-2 rounded-lg transition duration-300 w-full"
                          >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;