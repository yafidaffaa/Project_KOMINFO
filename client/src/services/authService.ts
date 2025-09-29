import api from "./api";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../features/auth/authTypes";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const register = async (data: RegisterRequest): Promise<{ message: string }> => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

// Reset Password
export const resetPassword = async (token: string, passwordBaru: string): Promise<{ message: string }> => {
  const res = await api.post("/auth/reset-password", { token, passwordBaru });
  return res.data;
};