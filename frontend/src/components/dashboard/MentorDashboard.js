import React from 'react';

export const MentorDashboard = ({ profile }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Mentor Information</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Expertise</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile?.role_data?.expertise?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Mentees</p>
          <p className="font-medium">
            {profile?.role_data?.mentees?.length || 0} mentees
          </p>
        </div>
      </div>
    </div>
  );
};