import api from "./api";

export const authService = {
  register: (payload) =>
    api.post("/auth/send-otp", { ...payload, type: "registration" }).then((r) => r.data),
  verifyEmail: (payload) => api.post("/auth/verify-otp", payload).then((r) => r.data),
  resendOtp: (payload) => api.post("/auth/resend-otp", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  refresh: () => api.post("/auth/refresh").then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }).then((r) => r.data),
  verifyForgotOtp: (payload) => api.post("/auth/verify-reset-otp", payload).then((r) => r.data),
  resetPassword: (payload) => api.post("/auth/reset-password", payload).then((r) => r.data),
};
