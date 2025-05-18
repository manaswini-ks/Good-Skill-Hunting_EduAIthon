import axios from 'axios';


const BASE_URL = 'http://localhost:5000';


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 second timeout
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Add more context to the error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      error.message = `Server error: ${error.response.status} - ${error.response.data?.error || error.message}`;
    } else if (error.request) {
      // The request was made but no response was received
      error.message = 'No response received from server. Check your connection.';
    }
    
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};


export const mentorAPI = {
  getAllMentors: () => api.get('/mentor/all'),
  getMentorById: (id) => api.get(`/mentor/profile/${id}`),
  updateProfile: (id, data) => api.put(`/mentor/profile/${id}`, data),
  // Mentor connections
  requestConnection: (data) => api.post('/mentor/connections/request', data),
  getUserConnections: (userId, userRole) => api.get(`/mentor/connections/${userId}/${userRole}`),
  getMentorConnections: (mentorId) => api.get(`/mentor/connections/mentor/${mentorId}`),
  updateConnectionStatus: (connectionId, status) => api.put(`/mentor/connections/${connectionId}/status`, { status }),
  // Mentor matching
  getMatchingMentors: (studentId) => api.post('/match/', { student_id: studentId }),
};


export const studentAPI = {
  getProfile: (id) => api.get(`/student/profile/${id}`),
  updateProfile: (id, data) => api.put(`/student/profile/${id}`, data),
  getProjects: (studentId) => api.get(`/student/projects/${studentId}`),
  createProject: (data) => api.post('/student/projects', data),
  updateProject: (projectId, data) => api.put(`/student/projects/${projectId}`, data),
  deleteProject: (projectId) => api.delete(`/student/projects/${projectId}`),
};

export const entrepreneurAPI = {
  getProfile: (id) => api.get(`/entrepreneur/profile/${id}`),
  updateProfile: (id, data) => api.put(`/entrepreneur/profile/${id}`, data),
  getOpportunities: (id) => api.get(`/entrepreneur/opportunities/${id}`),
  createOpportunity: (id, data) => api.post(`/entrepreneur/opportunities/${id}`, data),
  updateOpportunity: (id, opportunityId, data) => api.put(`/entrepreneur/opportunities/${id}/${opportunityId}`, data),
  deleteOpportunity: (id, opportunityId) => api.delete(`/entrepreneur/opportunities/${id}/${opportunityId}`),
};

export default api;