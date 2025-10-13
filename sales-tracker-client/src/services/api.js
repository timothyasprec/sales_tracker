const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// Auth API calls
export const authAPI = {
  login: (credentials) => 
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData) => 
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// User API calls
export const userAPI = {
  getAllUsers: () => apiRequest('/api/users'),
  
  getUserById: (id) => apiRequest(`/api/users/${id}`),
  
  updateUser: (id, userData) => 
    apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
};

// Outreach API calls
export const outreachAPI = {
  getAllOutreach: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/api/outreach?${params}`);
  },
  
  getOutreachById: (id) => apiRequest(`/api/outreach/${id}`),
  
  createOutreach: (outreachData) => 
    apiRequest('/api/outreach', {
      method: 'POST',
      body: JSON.stringify(outreachData),
    }),
  
  updateOutreach: (id, outreachData) => 
    apiRequest(`/api/outreach/${id}`, {
      method: 'PUT',
      body: JSON.stringify(outreachData),
    }),
  
  deleteOutreach: (id) => 
    apiRequest(`/api/outreach/${id}`, {
      method: 'DELETE',
    }),
};

// Job Posting API calls
export const jobPostingAPI = {
  getAllJobPostings: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/api/job-postings?${params}`);
  },
  
  getJobPostingById: (id) => apiRequest(`/api/job-postings/${id}`),
  
  createJobPosting: (jobPostingData) => 
    apiRequest('/api/job-postings', {
      method: 'POST',
      body: JSON.stringify(jobPostingData),
    }),
  
  updateJobPosting: (id, jobPostingData) => 
    apiRequest(`/api/job-postings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobPostingData),
    }),
  
  deleteJobPosting: (id) => 
    apiRequest(`/api/job-postings/${id}`, {
      method: 'DELETE',
    }),
  
  addBuilder: (id, builderData) => 
    apiRequest(`/api/job-postings/${id}/builders`, {
      method: 'POST',
      body: JSON.stringify(builderData),
    }),
  
  getBuilders: (id) => apiRequest(`/api/job-postings/${id}/builders`),
};

export default {
  auth: authAPI,
  users: userAPI,
  outreach: outreachAPI,
  jobPostings: jobPostingAPI,
};

