import apiClient from './client';
import type { User, AuthTokens } from '@shared/types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function apiRegister(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<{ success: true; data: AuthResponse }>('/auth/register', {
    email,
    password,
  });
  return data.data;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<{ success: true; data: AuthResponse }>('/auth/login', {
    email,
    password,
  });
  return data.data;
}

export async function apiLogout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function apiGetMe(): Promise<{ user: { userId: string; email: string } }> {
  const { data } = await apiClient.get<{
    success: true;
    data: { user: { userId: string; email: string } };
  }>('/auth/me');
  return data.data;
}

export type { User, AuthTokens };
