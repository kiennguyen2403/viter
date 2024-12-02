import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // Set your API base URL
    timeout: 5000, // Set a timeout
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add authentication token, headers, or modify the request config
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request error
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally, e.g., refresh token or redirect on 401
        if (error.response?.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
