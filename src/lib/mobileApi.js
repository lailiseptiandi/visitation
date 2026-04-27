import axios from 'axios';

const mobileApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/mb`,
  headers: {
    'Content-Type': 'application/json',
  },
});

mobileApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

mobileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default mobileApi;
