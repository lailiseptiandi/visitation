import { create } from 'zustand';
import mobileApi from '../lib/mobileApi';

const useMobileVisitStore = create((set, get) => ({
  // Outlet route for today
  outlets: [],
  summary: null,
  routeDate: null,
  isFirstSetup: false,
  isLoadingOutlets: false,

  // Attendance
  attendance: null,
  isLoadingAttendance: false,

  // Outlet detail
  outletDetail: null,
  outletOrders: [],
  outletOrdersMeta: null,
  isLoadingDetail: false,
  isLoadingOrders: false,

  // Processing state
  isProcessing: false,
  error: null,
  successMessage: null,

  clearMessages: () => set({ error: null, successMessage: null }),

  // ─── Outlet Route ────────────────────────────────────────────────────────────
  fetchOutletIndex: async (date = null) => {
    set({ isLoadingOutlets: true, error: null });
    try {
      const params = date ? { date } : {};
      const response = await mobileApi.get('/visit-sales-outlet/outlet/index', { params });
      const data = response.data?.data;
      set({
        outlets: data?.outlets || [],
        summary: data?.summary || null,
        routeDate: data?.date || null,
        isFirstSetup: data?.is_first_setup || false,
        isLoadingOutlets: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Gagal memuat rute hari ini',
        isLoadingOutlets: false,
      });
    }
  },

  // Optimistically update a single outlet status in the list
  _updateOutletInList: (outletId, patch) => {
    set((state) => ({
      outlets: state.outlets.map((o) =>
        o.outlet_id === outletId ? { ...o, ...patch } : o
      ),
    }));
  },

  // Update summary counters after a visit action
  _updateSummary: (from, to) => {
    set((state) => {
      if (!state.summary) return {};
      const s = { ...state.summary };
      const statusToKey = {
        inactive: 'remaining',
        'on-the-way': 'on_the_way',
        checkin: 'ongoing',
        checkout: 'visited',
        completed: 'visited',
        cancelled: 'remaining',
      };
      const fromKey = statusToKey[from];
      const toKey = statusToKey[to];
      if (fromKey && s[fromKey] !== undefined) s[fromKey] = Math.max(0, s[fromKey] - 1);
      if (toKey && s[toKey] !== undefined) s[toKey] += 1;
      return { summary: s };
    });
  },

  // ─── Visit Flow ──────────────────────────────────────────────────────────────
  startOnTheWay: async ({ salesmanId, outletId, latitude, longitude }) => {
    set({ isProcessing: true, error: null, successMessage: null });
    try {
      const res = await mobileApi.post('/visit-sales-outlet/visit/on-the-way', {
        salesman_id: salesmanId,
        outlet_id: outletId,
        latitude,
        longitude,
      });
      const visitData = res.data?.data;
      get()._updateOutletInList(outletId, {
        visit_status: 'on-the-way',
        visit_id: visitData?.id || '',
      });
      get()._updateSummary('inactive', 'on-the-way');
      set({ isProcessing: false, successMessage: 'Perjalanan dimulai!' });
      return visitData;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Gagal memulai perjalanan',
        isProcessing: false,
      });
      return null;
    }
  },

  cancelOnTheWay: async ({ visitId, outletId }) => {
    set({ isProcessing: true, error: null, successMessage: null });
    try {
      await mobileApi.delete(`/visit-sales-outlet/visit/on-the-way/${visitId}`);
      get()._updateOutletInList(outletId, { visit_status: 'inactive', visit_id: '' });
      get()._updateSummary('on-the-way', 'inactive');
      set({ isProcessing: false, successMessage: 'Perjalanan dibatalkan' });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Gagal membatalkan perjalanan',
        isProcessing: false,
      });
      return false;
    }
  },

  checkin: async ({ salesmanId, outletId, latitude, longitude, visitNote = '', visitDate = null }) => {
    set({ isProcessing: true, error: null, successMessage: null });
    try {
      const payload = {
        salesman_id: salesmanId,
        outlet_id: outletId,
        latitude,
        longitude,
        visit_note: visitNote,
      };
      if (visitDate) payload.visit_date = visitDate;

      const res = await mobileApi.post('/visit-sales-outlet/visit/checkin', payload);
      const visitData = res.data?.data;
      const prevStatus = get().outlets.find((o) => o.outlet_id === outletId)?.visit_status || 'inactive';
      get()._updateOutletInList(outletId, {
        visit_status: 'checkin',
        visit_id: visitData?.id || '',
        checkin_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
      get()._updateSummary(prevStatus, 'checkin');
      set({ isProcessing: false, successMessage: 'Check in berhasil!' });
      return visitData;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Gagal check in',
        isProcessing: false,
      });
      return null;
    }
  },

  checkout: async ({ visitId, outletId, visitStatus, latitude, longitude, visitNote = '', visitPhoto = '' }) => {
    set({ isProcessing: true, error: null, successMessage: null });
    try {
      const res = await mobileApi.post('/visit-sales-outlet/visit/checkout', {
        visit_id: visitId,
        visit_status: visitStatus,
        latitude,
        longitude,
        visit_note: visitNote,
        visit_photo: visitPhoto,
      });
      const visitData = res.data?.data;
      get()._updateOutletInList(outletId, {
        visit_status: visitStatus,
        checkout_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
      get()._updateSummary('checkin', visitStatus);
      set({ isProcessing: false, successMessage: 'Check out berhasil!' });
      return visitData;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Gagal check out',
        isProcessing: false,
      });
      return null;
    }
  },

  // ─── Attendance ─────────────────────────────────────────────────────────────
  fetchAttendance: async (date = null) => {
    set({ isLoadingAttendance: true, error: null });
    try {
      const params = date ? { date } : {};
      const res = await mobileApi.get('/visit-sales-outlet/attendance', { params });
      set({ attendance: res.data?.data || null, isLoadingAttendance: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Gagal memuat absensi',
        isLoadingAttendance: false,
      });
    }
  },

  // ─── Outlet Detail ───────────────────────────────────────────────────────────
  fetchOutletDetail: async (outletId, date = null) => {
    set({ isLoadingDetail: true, error: null, outletDetail: null });
    try {
      const params = date ? { date } : {};
      const res = await mobileApi.get(`/visit-sales-outlet/outlet/${outletId}`, { params });
      set({ outletDetail: res.data?.data || null, isLoadingDetail: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Gagal memuat detail outlet',
        isLoadingDetail: false,
      });
    }
  },

  fetchOutletOrders: async (outletId, page = 1, limit = 10) => {
    set({ isLoadingOrders: true });
    try {
      const res = await mobileApi.get(`/visit-sales-outlet/outlet/${outletId}/orders`, {
        params: { page, limit },
      });
      set({
        outletOrders: res.data?.data || [],
        outletOrdersMeta: res.data?.meta || null,
        isLoadingOrders: false,
      });
    } catch {
      set({ isLoadingOrders: false });
    }
  },

  // ─── Location ────────────────────────────────────────────────────────────────
  updateLocation: async ({ salesmanId, latitude, longitude, accuracy = null }) => {
    try {
      await mobileApi.post('/visit-sales-outlet/location/update', {
        salesman_id: salesmanId,
        latitude,
        longitude,
        ...(accuracy !== null ? { accuracy } : {}),
      });
    } catch {
      // silently fail for background location updates
    }
  },
}));

export default useMobileVisitStore;
