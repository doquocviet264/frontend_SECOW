import axios from "axios";
import { ENV } from "./env";

const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → gắn token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Có thể redirect login nếu cần
      window.location.href = "/auth/signin";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
