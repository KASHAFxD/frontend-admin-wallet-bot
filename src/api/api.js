import axios from "axios";
import { useAuth } from "../hooks/useAuth";

// Create a new Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASEURL || "http://localhost:8000",
  timeout: 15000,
});

// Helper: attach Basic Auth header from stored session
apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const storedToken = sessionStorage.getItem("authToken");
      if (storedToken) {
        config.headers.Authorization = `Basic ${storedToken}`;
      }
    }
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
