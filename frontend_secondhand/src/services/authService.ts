import axios from "@/config/axios";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOTPPayload,
  ForgotPasswordPayload,
  VerifyOTPForPasswordResetPayload,
  ResetPasswordPayload,
  AuthResponse,
  ApiResponse,
} from "@/types/auth";

const AUTH_PREFIX = "/v1/auth";

export const authService = {
  async register(payload: RegisterPayload): Promise<ApiResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/register`, payload);
    return res.data;
  },

  async verifyOTP(payload: VerifyOTPPayload): Promise<ApiResponse<AuthResponse>> {
    const res = await axios.post(`${AUTH_PREFIX}/verify-otp`, payload);

    if (res.data?.data?.accessToken) {
      localStorage.setItem("token", res.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      if (res.data.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
      }
    }

    return res.data;
  },

  async resendOTP(email: string): Promise<ApiResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/resend-otp`, { email });
    return res.data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const res = await axios.post(`${AUTH_PREFIX}/login`, payload);

    if (res.data?.data?.accessToken) {
      localStorage.setItem("token", res.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      if (res.data.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
      }
    }

    return res.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/forgot-password`, payload);
    return res.data;
  },

  async verifyOTPForPasswordReset(payload: VerifyOTPForPasswordResetPayload): Promise<ApiResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/verify-otp-password-reset`, payload);
    return res.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/reset-password`, payload);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<{ user: AuthResponse["user"] }>> {
    const res = await axios.get(`${AUTH_PREFIX}/me`);
    return res.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const res = await axios.put(`${AUTH_PREFIX}/change-password`, data);
    return res.data;
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    try {
      const res = await axios.post(`${AUTH_PREFIX}/refresh-token`, {
        refreshToken,
      });

      if (res.data?.data?.accessToken) {
        localStorage.setItem("token", res.data.data.accessToken);
        return res.data.data.accessToken;
      }
      return null;
    } catch (error) {
      // Refresh token cũng hết hạn hoặc không hợp lệ
      this.logout();
      return null;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/auth/signin";
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
