import axios from 'axios';
import type { PlaceCreate, PlaceResponse, PlaceUpdate } from './interfaces';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface PaginatedPlaces {
  total_count: number;
  page: number;
  page_size: number;
  results: PlaceResponse[];
}

export interface PlacesQueryParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export const getPlaces = (params?: PlacesQueryParams) =>
  api.get<PaginatedPlaces>('/api/place', { params });

export const getPlace = (id: number) =>
  api.get<PlaceResponse>(`/api/places/${id}/`);

export const createPlace = (data: PlaceCreate) =>
  api.post<PlaceResponse>('/api/place', data);

export const updatePlace = (id: number, data: PlaceUpdate) =>
  api.put<PlaceResponse>(`/api/places/${id}/`, data);

export const deletePlace = (id: number) =>
  api.delete(`/api/places/${id}/`);

// Auth helper utilities
export const authAPI = {
  login: async (credentials: any) => {
    // Hits your Django JWT token endpoint (e.g., /api/token/ or /auth/login/)
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },
  
  signup: async (userData: any) => {
    // Hits your registration view matching your Pydantic User Create Schema
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};

export default api;
