import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (username, email, password) => {
  const response = await authApi.post('/register/', {
    username,
    email,
    password,
  });
  return response.data;
};

export const login = async (username, password) => {
  const response = await authApi.post('/token/', {
    username,
    password,
  });
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) return null;

  try {
    const response = await authApi.post('/token/refresh/', {
      refresh,
    });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
    }
    return response.data.access;
  } catch (error) {
    logout();
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem('token');

export const isAuthenticated = () => !!getAuthToken(); 