import api from './api';
import type { ApiResponse, AuthResponse, User } from '@/types';

export async function login(email: string, password: string) {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  const data = res.data.data;
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
}

export async function signup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
  const authData = res.data.data;
  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('refreshToken', authData.refreshToken);
  return authData;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export async function getProfile() {
  const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  return res.data.data.user;
}

export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}
