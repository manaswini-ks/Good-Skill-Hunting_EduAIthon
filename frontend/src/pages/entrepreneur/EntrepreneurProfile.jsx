import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EntrepreneurProfile = () => {
  const { id } = useParams();
  const currentUserId = localStorage.getItem('entrepreneur_id');
  const userId = id || currentUserId;
  const isOwnProfile = !id || id === currentUserId;
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No entrepreneur ID found. Please log in again.');
      return;
    }

    fetch(`http://localhost:5000/entrepreneur/profile/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        setProfile(data);
        const formData = {
          ...data,
          interests: data.interests?.join(', ') || '',
          industries: data.industries?.join(', ') || '',
          achievements: Array.isArray(data.achievements) ? data.achievements.join(';') : (data.achievements || '')
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
    const payload = {
      ...form,
      interests: form.interests?.split(',').map(t => t.trim()) || [],
      industries: form.industries?.split(',').map(t => t.trim()) || [],
      achievements: form.achievements?.split(';').map(t => t.trim()) || [],
      socials: {
        linkedin: form.socials?.linkedin || '',
        twitter: form.socials?.twitter || '',
        website: form.socials?.website || '',
      },
    };

    const method = profileId ? 'PUT' : 'POST';
    const url = profileId
      ? `http://localhost:5000/entrepreneur/profile/${profileId}`
      : `http://localhost:5000/entrepreneur/profile/${userId}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error(`Failed to save profile: ${res.status}`);
      
      const updated = await res.json();
      setProfile(updated);
      setForm({
        ...updated,
        interests: updated.interests?.join(', ') || '',
        industries: updated.industries?.join(', ') || '',
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

  if (loading) return <div className="text-center py-6 text-gray-500">Loading...</div>;
  if (!profile && !isEditing) return <div className="text-center text-red-600">Profile not found. Click edit to create one.</div>;

  return (
    <div className="min-h-screen bg-primary-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Profile' : 'Entrepreneur Profile'}</h1>
            {isOwnProfile && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 font-medium shadow-md"
                >
                  {isEditing ? 'Cancel' : profile ? 'Edit' : 'Create'}
                </button>
              </div>
            )}
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
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  value={form.fullName || ''}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <input
                  name="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  placeholder="Email"
                  className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <input
                name="companyName"
                value={form.companyName || ''}
                onChange={handleChange}
                placeholder="Company Name"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <textarea
                name="companyDescription"
                value={form.companyDescription || ''}
                onChange={handleChange}
                placeholder="Company Description"
                rows={4}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                name="position"
                value={form.position || ''}
                onChange={handleChange}
                placeholder="Position/Role"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                name="industries"
                value={form.industries || ''}
                onChange={handleChange}
                placeholder="Industries (comma-separated)"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                name="interests"
                value={form.interests || ''}
                onChange={handleChange}
                placeholder="Interests/Focus Areas (comma-separated)"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                name="stage"
                value={form.stage || ''}
                onChange={handleChange}
                placeholder="Startup Stage (e.g., Seed, Series A)"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                name="achievements"
                value={form.achievements || ''}
                onChange={handleChange}
                placeholder="Achievements/Milestones (separated by ;)"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    name="socials.linkedin"
                    value={form.socials?.linkedin || ''}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      socials: { ...prev.socials, linkedin: e.target.value }
                    }))}
                    placeholder="LinkedIn Profile"
                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <input
                    name="socials.twitter"
                    value={form.socials?.twitter || ''}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      socials: { ...prev.socials, twitter: e.target.value }
                    }))}
                    placeholder="Twitter Profile"
                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <input
                    name="socials.website"
                    value={form.socials?.website || ''}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      socials: { ...prev.socials, website: e.target.value }
                    }))}
                    placeholder="Company Website"
                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300 font-medium shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : profile ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                  <div className="mt-3 space-y-3">
                    <div>
                      <span className="text-gray-500 font-medium">Full Name:</span>
                      <p>{profile.fullName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Email:</span>
                      <p>{profile.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Position:</span>
                      <p>{profile.position || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Company Details</h2>
                  <div className="mt-3 space-y-3">
                    <div>
                      <span className="text-gray-500 font-medium">Company Name:</span>
                      <p>{profile.companyName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Startup Stage:</span>
                      <p>{profile.stage || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Company Description</h2>
                <p className="mt-2 text-gray-700">{profile.companyDescription || 'No description provided'}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Industries</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.industries && profile.industries.length > 0 ? (
                    profile.industries.map((industry, idx) => (
                      <span key={idx} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                        {industry}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No industries specified</p>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Interests & Focus Areas</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest, idx) => (
                      <span key={idx} className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests specified</p>
                  )}
                </div>
              </div>
              
              {profile.achievements && profile.achievements.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Achievements</h2>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {profile.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-800">Social Links</h2>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {profile.socials?.linkedin && (
                    <a 
                      href={profile.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                  {profile.socials?.twitter && (
                    <a 
                      href={profile.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Twitter Profile
                    </a>
                  )}
                  {profile.socials?.website && (
                    <a 
                      href={profile.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Company Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-gray-500">No profile found. Click "Edit" to create your profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurProfile; 