import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003/api',
 headers: {
 'Content-Type': 'application/json',
 },
});

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('wms_token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => Promise.reject(error)
);

// Response Interceptor: Global Error & Auth Handling
api.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response && error.response.status === 401) {
 localStorage.removeItem('wms_token');
 localStorage.removeItem('wms_user');
 if (window.location.pathname !== '/login') {
 window.location.href = '/login?expired=1';
 }
 }
 return Promise.reject(error);
 }
);

export default api;
