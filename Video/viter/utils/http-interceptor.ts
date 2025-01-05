import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";

const useAxiosInterceptor = () => {
    const { user } = useUser(); // Use the hook inside this custom hook

    const apiClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        timeout: 20000,
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Add interceptors
    apiClient.interceptors.request.use(
        (config) => {
            if (user?.token) {
                // Attach user token to the Authorization header
                config.headers.Authorization = `Bearer ${user.token}`;
            }
            return config;
        },
        (error) => Promise.reject(error),
    );

    apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error("Error response", error.response);
            // Handle errors globally, e.g., refresh token or redirect on 401
            switch (error?.response?.status) {
                case 401:
                    // Redirect to login page
                    break;
                case 403:
                    // Redirect to forbidden page
                    break;
                case 404:
                    // Redirect to not found page
                    break;
                case 500:
                    // Redirect to server error page
                    break;
                default:
                    break;
            }
            return Promise.reject(error);
        },
    );

    return apiClient;
};

export default useAxiosInterceptor;
