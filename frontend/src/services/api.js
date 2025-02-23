import axios from 'axios';
import { getAuthToken, refreshToken, logout } from './auth';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getTasks = async () => {
  const response = await api.get('/tasks/');
  return response.data;
};

export const getTask = async (id) => {
  const response = await api.get(`/tasks/${id}/`);
  return response.data;
};

export const createTask = async (task) => {
  const response = await api.post('/tasks/', task);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await api.put(`/tasks/${id}/`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}/`);
};

export const toggleTaskStatus = async (id, task) => {
  const response = await api.patch(`/tasks/${id}/`, {
    is_completed: !task.is_completed,
  });
  return response.data;
}; 