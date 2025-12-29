import axios from "@/config/axios";
import type { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";

const AUTH_PREFIX = "v1/auth";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/login`, payload);

    if (res.data?.accessToken) {
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await axios.post(`${AUTH_PREFIX}/register`, payload);

    if (res.data?.accessToken) {
      localStorage.setItem("access_token", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    return res.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },
};
