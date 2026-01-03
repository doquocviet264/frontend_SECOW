import axios from "axios";
import { ENV } from "./env";

const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tạo axios instance riêng cho refresh token để tránh interceptor loop
const axiosRefresh = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để track xem đang refresh token hay không (tránh infinite loop)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // Retry request với token mới
      prom.config.headers.Authorization = `Bearer ${token}`;
      prom.resolve(axiosInstance(prom.config));
    }
  });

  failedQueue = [];
};

// Request interceptor → gắn token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu là FormData, không set Content-Type để browser tự động set với boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → xử lý lỗi và tự động refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh token, đợi kết quả
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Không có refresh token, logout
        processQueue(error, null);
        isRefreshing = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/signin";
        return Promise.reject(error);
      }

      try {
        // Gọi refresh token endpoint
        const response = await axiosRefresh.post("/v1/auth/refresh-token", {
          refreshToken,
        });

        const { accessToken } = response.data?.data || {};

        if (accessToken) {
          localStorage.setItem("token", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          isRefreshing = false;
          // Retry request ban đầu với token mới
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Không nhận được access token mới");
        }
      } catch (refreshError) {
        // Refresh token cũng hết hạn hoặc không hợp lệ
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
