import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorProfile = () => {
  const userId = localStorage.getItem('mentor_id');
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No mentor ID found. Please log in again.');
      return;
    }

    console.log('Fetching mentor profile for ID:', userId);

    fetch(`http://localhost:5000/mentor/profile/${userId}`)
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
          expertise: data.expertise?.join(', ') || '',
          availability: data.availability?.join(', ') || '',
          certifications: Array.isArray(data.certifications) ? data.certifications.join(';') : (data.certifications || '')
        };
        setForm(formData);
        setProfileId(data._id);
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
        setError(err.message);
      });
  }, [userId]);

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
        expertise: form.expertise?.split(',').map(t => t.trim()) || [],
        availability: form.availability?.split(',').map(t => t.trim()) || [],
        certifications: form.certifications?.split(';').map(t => t.trim()) || [],
        socials: {
          github: form.socials?.github || '',
          linkedin: form.socials?.linkedin || '',
          website: form.socials?.website || '',
        },
      };

      console.log('Saving profile with payload:', payload);

      const method = profileId ? 'PUT' : 'POST';
      const url = profileId
        ? `http://localhost:5000/mentor/profile/${profileId}`
        : `http://localhost:5000/mentor/profile/${userId}`;

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
        expertise: updated.expertise?.join(', ') || '',
        availability: updated.availability?.join(', ') || '',
        certifications: Array.isArray(updated.certifications) ? updated.certifications.join(';') : (updated.certifications || '')
      });
      setProfileId(updated._id);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mentor_id');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center border border-gray-200">
          <div className="text-red-600 mb-6 font-medium">Please log in to view your profile</div>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium transition duration-300 shadow-md hover:shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50">
      <div className="text-center py-6 text-gray-600 animate-pulse font-medium">
        <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-teal-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Profile' : 'Mentor Profile'}</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-emerald-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 font-medium shadow-md"
              >
                {isEditing ? 'Cancel' : profile ? 'Edit' : 'Create'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 font-medium shadow-md"
              >
                Logout
        </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

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
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    value={form.email || ''}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                <input
                  name="title"
                  value={form.title || ''}
                  onChange={handleChange}
                  placeholder="Professional Title"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                <textarea
                  name="bio"
                  value={form.bio || ''}
                  onChange={handleChange}
                  placeholder="Professional Bio"
                  rows={4}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise (comma-separated)</label>
                <input
                  name="expertise"
                  value={form.expertise || ''}
                  onChange={handleChange}
                  placeholder="Areas of Expertise (comma-separated)"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    name="experience"
                    value={form.experience || ''}
                    onChange={handleChange}
                    placeholder="Years of Experience"
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <input
                    name="availability"
                    value={form.availability || ''}
                    onChange={handleChange}
                    placeholder="Availability (e.g., 'Weekdays, Evenings')"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (separated by ;)</label>
                <input
                  name="certifications"
                  value={form.certifications || ''}
                  onChange={handleChange}
                  placeholder="Certifications (separated by ;)"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                />
      </div>

              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                    <input
                      name="socials.linkedin"
                      value={form.socials?.linkedin || ''}
                      onChange={e => setForm(prev => ({
                        ...prev,
                        socials: { ...prev.socials, linkedin: e.target.value }
                      }))}
                      placeholder="LinkedIn Profile"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website</label>
                    <input
                      name="socials.website"
                      value={form.socials?.website || ''}
                      onChange={e => setForm(prev => ({
                        ...prev,
                        socials: { ...prev.socials, website: e.target.value }
                      }))}
                      placeholder="Personal Website"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium transition duration-300 shadow-md hover:shadow-lg"
                >
                  Save Profile
                </button>
              </div>
        </form>
          ) : (
            <div className="space-y-0">
              {!profile ? (
                <div className="text-center py-16">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div className="text-gray-500 mb-6 text-lg">No profile found. Click 'Create' to set up your profile.</div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium transition duration-300 shadow-md hover:shadow-lg"
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 mb-4 flex items-center justify-center text-white text-2xl font-bold">
                          {profile.fullName?.charAt(0) || "M"}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{profile.fullName}</h2>
                        <p className="text-gray-600 text-sm">{profile.email}</p>
                        <p className="text-emerald-600 font-medium mt-1">{profile.title}</p>
                        
                        <div className="mt-5 w-full">
                          <div className="flex items-center justify-center mb-2">
                            <svg className="h-5 w-5 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-700 font-medium">{profile.experience} years experience</p>
                          </div>
                        </div>
                        
                        <div className="w-full mt-6">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Available</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {profile.availability?.map((time, index) => (
                              <span key={index} className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full">
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="w-full mt-6">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Connect</p>
                          <div className="flex justify-center space-x-4">
                            {profile.socials?.linkedin && (
                              <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-emerald-600 transition duration-300">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                              </a>
                            )}
                            {profile.socials?.website && (
                              <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-emerald-600 transition duration-300">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="2" y1="12" x2="22" y2="12"></line>
                                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">About</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">Areas of Expertise</h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.expertise?.map((item, index) => (
                              <span key={index} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">Certifications</h3>
                          <ul className="list-disc pl-5 text-gray-700">
                            {profile.certifications?.map((cert, index) => (
                              <li key={index} className="mb-1">{cert}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;