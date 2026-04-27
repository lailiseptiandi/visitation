import { create } from 'zustand';
import api from '../lib/api';


const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('access_token') || null,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { username, password });
      const resData = response.data;

      const accessToken = resData?.data?.access_token;
      const refreshToken = resData?.data?.refresh_token;
      const userData = resData?.data?.super_account || resData?.data;

      if (!accessToken) {
        set({ error: 'Login gagal: token tidak ditemukan dalam response.', isLoading: false });
        return false;
      }

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, accessToken, isLoading: false });

      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal. Periksa username dan password.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  loginMobile: async (username, password, imei) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/mb/auth/login', { username, password, imei });
      const resData = response.data;

      const accessToken = resData?.data?.access_token;
      const refreshToken = resData?.data?.refresh_token;
      // Try multiple fallback paths for user/salesman data
      const userData =
        resData?.data?.salesman ||
        resData?.data?.user ||
        resData?.data?.super_account ||
        resData?.data;

      if (!accessToken) {
        set({ error: 'Login gagal: token tidak ditemukan dalam response.', isLoading: false });
        return false;
      }

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, accessToken, isLoading: false });

      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login gagal. Periksa username dan password.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
