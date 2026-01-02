export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
}

export interface VerifyOTPPayload {
  email: string;
  code: string;
  name: string;
  password: string;
  phone: string;
  dateOfBirth: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOTPForPasswordResetPayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ msg: string; path: string }>;
}
