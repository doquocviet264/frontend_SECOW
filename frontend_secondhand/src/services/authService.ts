import axios from "@/config/axios";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOTPPayload,
  ForgotPasswordPayload,
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
    }

    return res.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/forgot-password`, payload);
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

  logout() {
    localStorage.removeItem("token");
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

  isAuthenticated() {
    return !!this.getToken();
  },
};
