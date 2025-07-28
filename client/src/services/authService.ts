import axios from "axios";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../features/auth/authTypes";

const BASE_URL = "http://192.168.45.20:3000";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await axios.post(`${BASE_URL}/auth/login`, data);
  return res.data;
};

export const register = async (data: RegisterRequest): Promise<{ message: string }> => {
  const res = await axios.post(`${BASE_URL}/auth/register`, data);
  return res.data;
};
