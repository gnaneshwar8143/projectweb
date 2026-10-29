import axios from 'axios';
import type { Project, ApiResponse, User } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password }),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
};

// Projects
export const projectsApi = {
  list: () => api.get<ApiResponse<Project[]>>('/projects'),
  get: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (name: string, description?: string) =>
    api.post<ApiResponse<Project>>('/projects', { name, description }),
  update: (id: string, data: Partial<Project>) =>
    api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/projects/${id}`),
  duplicate: (id: string) => api.post<ApiResponse<Project>>(`/projects/${id}/duplicate`),
};

// Assets
export const assetsApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<{ url: string; id: string; name: string }>>('/assets/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get<ApiResponse<{ url: string; id: string; name: string; size: number }[]>>('/assets'),
  delete: (id: string) => api.delete<ApiResponse>(`/assets/${id}`),
};

export default api;
