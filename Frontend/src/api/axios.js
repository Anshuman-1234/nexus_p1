import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors (Optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401 Unauthorized, maybe clear token (but let context handle redirect via protected route)
        if (error.response && error.response.status === 401) {
            // localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
