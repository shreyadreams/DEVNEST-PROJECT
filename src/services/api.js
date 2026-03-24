import axios from 'axios';

// All API calls go through this instance
const API = axios.create({ baseURL: '/api' });

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('devnest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);
export const getMe        = ()     => API.get('/auth/me');

// ── DSA (Step 4) ──────────────────────────
export const getDSAProblems    = ()    => API.get('/dsa/problems');
export const markProblemSolved = (id)  => API.post(`/dsa/solve/${id}`);
export const markUnsolved = (id) => API.post(`/dsa/unsolve/${id}`);

// ── GitHub (Step 3) ───────────────────────
export const getGithubStats = (username) => API.get(`/github/stats/${username}`);
export const getGithubRepos = (username) => API.get(`/github/repos/${username}`);

// ── AI (Step 7) ───────────────────────────
export const getAIRoadmap = () => API.post('/ai/roadmap');
export const getReadiness = () => API.get('/ai/readiness');

export default API;
