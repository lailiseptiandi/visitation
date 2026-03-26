import { create } from 'zustand';
import api from '../lib/api';

const useVisitationStore = create((set, get) => ({
  groups: [],
  outlets: [],
  selectedSalesmanId: null,
  isLoadingGroups: false,
  isLoadingOutlets: false,
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
      const outletData = response.data?.data?.data || [];
      set({ outlets: outletData, isLoadingOutlets: false });
    } catch (error) {
      console.error('Error fetching outlets:', error);
      set({ error: 'Gagal memuat data outlet', isLoadingOutlets: false });
    }
  },

  selectSalesman: (salesmanId, groupSalesmanId) => {
    const current = get().selectedSalesmanId;
    if (current === salesmanId) {
      set({ selectedSalesmanId: null, outlets: [] });
    } else {
      get().fetchOutlets(salesmanId, groupSalesmanId);
    }
  },

  clearOutlets: () => set({ outlets: [], selectedSalesmanId: null }),
}));

export default useVisitationStore;
