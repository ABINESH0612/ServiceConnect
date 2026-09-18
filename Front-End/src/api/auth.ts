import { gatewayClient } from '@/lib/axios'
import type {
  LoginRequest,
  LoginResponse,
  RegisterCustomerRequest,
  RegisterProviderRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  RequestEmailVerificationRequest,
  SecurityInfo,
  DeleteAccountRequest,
  AuthUser,
} from '@/types'

// All auth endpoints are routed through Gateway: /api/v1/auth/**
const BASE = '/api/v1/auth'

export const authApi = {
  login: (data: LoginRequest) =>
    gatewayClient.post<LoginResponse>(`${BASE}/login`, data),

  registerCustomer: (data: RegisterCustomerRequest) =>
    gatewayClient.post<RegisterResponse>(`${BASE}/register`, data),

  registerProvider: (data: RegisterProviderRequest) =>
    gatewayClient.post<RegisterResponse>(`${BASE}/register/provider`, data),

  refresh: (data: RefreshTokenRequest) =>
    gatewayClient.post<RefreshResponse>(`${BASE}/refresh`, data),

  logout: (refreshToken: string) =>
    gatewayClient.post(`${BASE}/logout`, { refreshToken }),

  logoutAll: () =>
    gatewayClient.post(`${BASE}/logout-all`),

  getMe: () =>
    gatewayClient.get<AuthUser>(`${BASE}/me`),

  deleteAccount: (data: DeleteAccountRequest) =>
    gatewayClient.delete(`${BASE}/me`, { data }),

  requestEmailVerification: (data: RequestEmailVerificationRequest) =>
    gatewayClient.post(`${BASE}/verification/email/request`, data),

  verifyEmail: (data: VerifyEmailRequest) =>
    gatewayClient.post(`${BASE}/verification/email/verify`, data),

  requestPhoneVerification: (data: { phone: string }) =>
    gatewayClient.post(`${BASE}/verification/phone/request`, data),

  verifyPhone: (data: { phone: string; otp: string }) =>
    gatewayClient.post(`${BASE}/verification/phone/verify`, data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    gatewayClient.post(`${BASE}/password/forgot`, data),

  resetPassword: (data: ResetPasswordRequest) =>
    gatewayClient.post(`${BASE}/password/reset`, data),

  changePassword: (data: ChangePasswordRequest) =>
    gatewayClient.post(`${BASE}/password/change`, data),

  getSecurityInfo: () =>
    gatewayClient.get<SecurityInfo>(`${BASE}/me/security`),
}
