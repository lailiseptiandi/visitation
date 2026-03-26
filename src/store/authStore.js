import { create } from 'zustand';
import api from '../lib/api';


const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,


  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, data } = response.data;

      const authToken = token || response.data?.accessToken || response.data?.access_token;
      const userData = data || response.data?.user || response.data;

      if (authToken) {
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, token: authToken, isLoading: false });
      } else {
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, token: 'authenticated', isLoading: false });
      }

      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal. Periksa username dan password.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
