import axios from 'axios';
import type { 
  Event, 
  UserState, 
  Rule, 
  Decision, 
  DashboardSummary, 
  CreateEventDto, 
  CreateRuleDto,
  ProcessEventResult,
  LoginRequest,
  LoginResponse,
  AuthUser,
  User,
  CreateUserDto,
  UpdateUserDto
} from '../types';

const API_BASE_URL = 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  
  me: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>('/auth/me');
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Events API
export const eventsApi = {
  create: async (data: CreateEventDto): Promise<ProcessEventResult> => {
    const response = await api.post<ProcessEventResult>('/events', data);
    return response.data;
  },
  
  getRecent: async (count = 50): Promise<Event[]> => {
    const response = await api.get<Event[]>(`/events?count=${count}`);
    return response.data;
  },
  
  getByUser: async (userId: string): Promise<Event[]> => {
    const response = await api.get<Event[]>(`/events/user/${userId}`);
    return response.data;
  },

  getMy: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events/my');
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<UserState[]> => {
    const response = await api.get<UserState[]>('/users');
    return response.data;
  },

  getList: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/list');
    return response.data;
  },
  
  getState: async (userId: string): Promise<UserState> => {
    const response = await api.get<UserState>(`/users/${userId}/state`);
    return response.data;
  },
  
  resetDaily: async (): Promise<void> => {
    await api.post('/users/reset-daily');
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (userId: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, data);
    return response.data;
  },

  delete: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

// Rules API
export const rulesApi = {
  getAll: async (): Promise<Rule[]> => {
    const response = await api.get<Rule[]>('/rules');
    return response.data;
  },
  
  getById: async (ruleId: string): Promise<Rule> => {
    const response = await api.get<Rule>(`/rules/${ruleId}`);
    return response.data;
  },
  
  create: async (data: CreateRuleDto): Promise<Rule> => {
    const response = await api.post<Rule>('/rules', data);
    return response.data;
  },
  
  update: async (ruleId: string, data: Partial<Rule>): Promise<Rule> => {
    const response = await api.put<Rule>(`/rules/${ruleId}`, data);
    return response.data;
  },
  
  delete: async (ruleId: string): Promise<void> => {
    await api.delete(`/rules/${ruleId}`);
  },
  
  toggle: async (ruleId: string): Promise<Rule> => {
    const response = await api.patch<Rule>(`/rules/${ruleId}/toggle`);
    return response.data;
  },
};

// Decisions API
export const decisionsApi = {
  getAll: async (count = 100): Promise<Decision[]> => {
    const response = await api.get<Decision[]>(`/decisions?count=${count}`);
    return response.data;
  },
  
  getByUser: async (userId: string): Promise<Decision[]> => {
    const response = await api.get<Decision[]>(`/decisions/user/${userId}`);
    return response.data;
  },

  getMy: async (): Promise<Decision[]> => {
    const response = await api.get<Decision[]>('/decisions/my');
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
};

export default api;
