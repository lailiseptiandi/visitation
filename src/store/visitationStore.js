import { create } from 'zustand';
import api from '../lib/api';

const useVisitationStore = create((set, get) => ({
  groups: [],
  outlets: [],
  summary: null,
  route: null,
  selectedSalesmanId: null,
  selectedGroupId: null,
  isLoadingGroups: false,
  isLoadingOutlets: false,
  isGeneratingRoute: false,
  error: null,

  fetchGroups: async (search = '') => {
    set({ isLoadingGroups: true, error: null });
    try {
      const response = await api.get('/visit-sales-outlet/group-salesman-list', {
        params: { search },
      });
      const groups = response.data?.data || [];
      set({ groups, isLoadingGroups: false });
    } catch (error) {
      console.error('Error fetching groups:', error);
      set({ error: 'Gagal memuat data group', isLoadingGroups: false });
    }
  },

  fetchOutlets: async (salesmanId, groupSalesmanId) => {
    set({ isLoadingOutlets: true, error: null, selectedSalesmanId: salesmanId });
    try {
      const response = await api.get('/visit-sales-outlet/list', {
        params: {
          salesman_id: salesmanId,
          group_salesman_id: groupSalesmanId || '',
        },
      });
      const responseData = response.data?.data || {};
      const outletData = responseData.data || [];
      const routeData = responseData.route || null;
      set({ outlets: outletData, route: routeData, isLoadingOutlets: false });
    } catch (error) {
      console.error('Error fetching outlets:', error);
      set({ error: 'Gagal memuat data outlet', isLoadingOutlets: false });
    }
  },

  fetchSummary: async (salesmanId) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await api.get('/visit-sales-outlet/summary', {
        params: { salesman_id: salesmanId, date: today },
      });
      set({ summary: response.data?.data || null });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  },

  generateRoute: async (salesmanId, groupSalesmanId) => {
    set({ isGeneratingRoute: true });
    try {
      const response = await api.get('/visit-sales-outlet/generate-route', {
        params: {
          salesman_id: salesmanId,
          group_salesman_id: groupSalesmanId || '',
        },
      });
      set({ route: response.data?.data || null, isGeneratingRoute: false });
    } catch (error) {
      console.error('Error generating route:', error);
      set({ isGeneratingRoute: false });
    }
  },

  updateLocation: async (salesmanId, latitude, longitude, accuracy = 10) => {
    try {
      const response = await api.post('/visit-sales-outlet/location/update', {
        salesman_id: salesmanId,
        latitude,
        longitude,
        accuracy,
      });
      return { success: true, data: response.data?.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal update lokasi';
      return { success: false, message };
    }
  },

  selectSalesman: (salesmanId, groupSalesmanId) => {
    const current = get().selectedSalesmanId;
    if (current === salesmanId) {
      set({ selectedSalesmanId: null, selectedGroupId: null, outlets: [], summary: null, route: null });
    } else {
      set({ selectedGroupId: groupSalesmanId, route: null });
      get().fetchOutlets(salesmanId, groupSalesmanId);
      get().fetchSummary(salesmanId);
    }
  },

  clearOutlets: () => set({ outlets: [], selectedSalesmanId: null, selectedGroupId: null, summary: null, route: null }),
}));

export default useVisitationStore;
