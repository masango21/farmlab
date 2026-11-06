import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  crops as fallbackCrops,
  dashboardStats,
  learningModules,
  simulationCards,
  userProfile,
  type Crop,
} from '../data/farmData';

export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export type DashboardResponse = {
  farmName?: string;
  totalArea?: string;
  activeCrops?: number;
  activeSimulations?: number;
  estimatedProductivity?: string;
  healthScore?: string;
  recentActivities?: string[];
  name?: string;
  role?: string;
  learningProgress?: number;
  completedLessons?: number;
  assessmentScores?: number;
  totalLearners?: number;
  activeLearningAssignments?: number;
  completedAssignments?: number;
  pendingAssessments?: number;
  learnerPerformance?: string;
};

export type SimulationResponse = {
  slug?: string;
  title: string;
  status: string;
  predictedYield: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'LEARNER' | 'TRAINER';
  status?: string;
};

export async function getAuthToken() {
  return SecureStore.getItemAsync('auth_token');
}

export async function saveAuthToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync('auth_token');
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(API_BASE_URL + path);
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

async function requestJson<T>(path: string, options: RequestInit = {}, fallback: T): Promise<T> {
  try {
    const token = await getAuthToken();
    const response = await fetch(API_BASE_URL + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody && typeof errorBody === 'object' && 'message' in errorBody ? String((errorBody as { message?: string }).message) : 'Request failed';
      return { ...fallback, ...(typeof fallback === 'object' ? { message } : {}) } as T;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(API_BASE_URL + '/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (!response.ok) {
      await clearAuthToken();
      return null;
    }

    const data = (await response.json()) as { user?: CurrentUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export const farmApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('A valid session is required to load dashboard data.');
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error('A valid session is required to load dashboard data.');
    }

    const endpoint = user.role === 'TRAINER' ? '/api/trainer/dashboard' : '/api/learner/dashboard';

    const response = await fetch(API_BASE_URL + endpoint, {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody && typeof errorBody === 'object' && 'message' in errorBody ? String((errorBody as { message?: string }).message) : 'Unable to load dashboard data.';
      throw new Error(message);
    }

    return (await response.json()) as DashboardResponse;
  },
  getCrops: async (): Promise<Crop[]> => getJson<Crop[]>('/api/crops', fallbackCrops),
  getCrop: async (slug: string): Promise<Crop | null> => {
    const crops = await getJson<Crop[]>('/api/crops', fallbackCrops);
    return crops.find((crop) => crop.slug === slug) ?? crops[0] ?? null;
  },
  getSimulations: async (): Promise<SimulationResponse[]> =>
    getJson<SimulationResponse[]>('/api/simulations', simulationCards.map((item) => ({
      slug: item.slug,
      title: item.title,
      status: item.status,
      predictedYield: item.yield,
    }))),
  getProfile: async () => ({
    name: userProfile.name,
    role: userProfile.role,
    location: userProfile.location,
    farmName: userProfile.farmName,
    avatar: userProfile.avatar,
  }),
  getStats: async () => dashboardStats,
  getModules: async () => learningModules,
  register: async (payload: { firstName: string; lastName: string; email: string; password: string; role: 'LEARNER' | 'TRAINER'; acceptTerms: boolean }) =>
    requestJson<{ message: string; user?: { id: string; email: string; role: string } }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(payload) },
      { message: 'Unable to create account.' },
    ),
  login: async (payload: { email: string; password: string }) =>
    requestJson<{ token: string; user?: { id: string; email: string; firstName: string; lastName: string; role: string }; message?: string }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(payload) },
      { token: '', user: undefined, message: 'Unable to sign in.' },
    ),
  forgotPassword: async (payload: { email: string }) =>
    requestJson<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }, { message: 'Unable to process request.' }),
  resetPassword: async (payload: { token: string; password: string }) =>
    requestJson<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }, { message: 'Unable to reset password.' }),
  verifyEmail: async (payload: { token: string }) =>
    requestJson<{ message: string }>('/api/auth/verify-email', { method: 'POST', body: JSON.stringify(payload) }, { message: 'Unable to verify email.' }),
  resendVerification: async (payload: { email: string }) =>
    requestJson<{ message: string }>('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify(payload) }, { message: 'Unable to resend verification email.' }),
  me: async () => {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch(API_BASE_URL + '/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as { user?: CurrentUser };
  },
  logout: async () => {
    const token = await getAuthToken();
    if (!token) {
      return { message: 'No active session.' };
    }

    try {
      const response = await fetch(API_BASE_URL + '/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });

      const data = (await response.json().catch(() => ({ message: 'Logged out.' }))) as { message?: string };
      if (response.ok) {
        await clearAuthToken();
      }
      return { message: data.message ?? 'Logged out.' };
    } catch {
      await clearAuthToken();
      return { message: 'Logged out locally.' };
    }
  },
};