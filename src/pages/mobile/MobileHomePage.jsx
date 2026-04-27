import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  RefreshCw,
  Navigation,
  LogIn,
  LogOut,
  X,
  CheckCircle2,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCheck,
  XCircle,
  Bike,
  FileText,
  Camera,
  Star,
  Filter,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useMobileVisitStore from '../../store/mobileVisitStore';

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  inactive: {
    label: 'Belum Dikunjungi',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  'on-the-way': {
    label: 'Dalam Perjalanan',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  checkin: {
    label: 'Sedang Kunjungan',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  checkout: {
    label: 'Selesai Kunjungan',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'Selesai + Order',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-600',
  },
  cancelled: {
    label: 'Dibatalkan',
    bg: 'bg-red-100',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },
  closed: {
    label: 'Toko Tutup',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
  },
};

const SEG_CONFIG = {
  Gold: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🥇' },
  Silver: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: '🥈' },
  Bronze: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🥉' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null, accuracy: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve({ lat: null, lng: null, accuracy: null }),
      { timeout: 6000, enableHighAccuracy: true }
    );
  });

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SegBadge({ seg }) {
  const cfg = SEG_CONFIG[seg] || SEG_CONFIG.Silver;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.icon} {seg}
    </span>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="flex-1 bg-white rounded-xl p-3 text-center shadow-sm">
      <p className={`text-xl font-bold ${color}`}>{value ?? '-'}</p>
      <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{label}</p>
    </div>
  );
}

// ─── Visit Action Sheet ───────────────────────────────────────────────────────
function VisitActionSheet({ outlet, onClose, salesmanId }) {
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState('checkout');
  const [geoLoading, setGeoLoading] = useState(false);
  const [action, setAction] = useState(null); // 'onTheWay' | 'checkin' | 'checkout' | 'cancel'

  const {
    startOnTheWay,
    cancelOnTheWay,
    checkin,
    checkout,
    isProcessing,
    error,
    successMessage,
    clearMessages,
  } = useMobileVisitStore();

  useEffect(() => {
    clearMessages();
    // Determine default action based on status
    if (outlet.visit_status === 'inactive') setAction(null);
    else if (outlet.visit_status === 'on-the-way') setAction('checkin');
    else if (outlet.visit_status === 'checkin') setAction('checkout');
  }, [outlet.outlet_id]);

  const handleAction = async (actionType) => {
    setGeoLoading(true);
    const { lat, lng, accuracy } = await getPosition();
    setGeoLoading(false);

    if (actionType === 'onTheWay') {
      // No auto-close: store update will sync the outlet prop so the popup
      // naturally transitions to the 'on-the-way' state for immediate check-in.
      await startOnTheWay({ salesmanId, outletId: outlet.outlet_id, latitude: lat, longitude: lng });
    } else if (actionType === 'checkin') {
      const res = await checkin({ salesmanId, outletId: outlet.outlet_id, latitude: lat, longitude: lng, visitNote: note });
      if (res) setTimeout(onClose, 1000);
    } else if (actionType === 'checkout') {
      const res = await checkout({
        visitId: outlet.visit_id,
        outletId: outlet.outlet_id,
        visitStatus: checkoutStatus,
        latitude: lat,
        longitude: lng,
        visitNote: note,
        visitPhoto: photo,
      });
      if (res) setTimeout(onClose, 1000);
    } else if (actionType === 'cancel') {
      const res = await cancelOnTheWay({ visitId: outlet.visit_id, outletId: outlet.outlet_id });
      if (res) setTimeout(onClose, 800);
    }
  };

  const loading = isProcessing || geoLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl w-full shadow-2xl pb-8 animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex-1 pr-3">
            <p className="text-xs text-gray-400 font-medium">Outlet</p>
            <p className="text-base font-bold text-gray-900 leading-tight">{outlet.outlet_name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{outlet.address}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
              <X size={18} className="text-gray-400" />
            </button>
            <SegBadge seg={outlet.segmentation_label} />
          </div>
        </div>

        <div className="px-5 pt-4 space-y-4">
          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          {successMessage && (
            <div className="flex items-center gap-2.5 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {/* ── INACTIVE: choose action ──────────────── */}
          {outlet.visit_status === 'inactive' && !action && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Pilih Tindakan</p>
              <button
                onClick={() => setAction('onTheWay')}
                className="w-full flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left hover:bg-blue-100 active:bg-blue-200 transition-colors"
              >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bike size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Mulai Perjalanan</p>
                  <p className="text-xs text-gray-500">Berangkat menuju outlet ini</p>
                </div>
              </button>
              <button
                onClick={() => setAction('checkin')}
                className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left hover:bg-amber-100 active:bg-amber-200 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LogIn size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Langsung Check In</p>
                  <p className="text-xs text-gray-500">Sudah di lokasi outlet</p>
                </div>
              </button>
            </div>
          )}

          {/* ── ON THE WAY: check in or cancel ───────── */}
          {outlet.visit_status === 'on-the-way' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 rounded-xl px-3 py-2.5">
                <Navigation size={16} className="animate-pulse" />
                <span className="text-sm font-medium">Sedang dalam perjalanan ke outlet ini</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Catatan Check In (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Kondisi outlet, keperluan kunjungan..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <button
                onClick={() => handleAction('checkin')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3.5 rounded-2xl hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                Check In Sekarang
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 font-semibold py-3 rounded-2xl hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 text-sm"
              >
                <XCircle size={16} />
                Batalkan Perjalanan
              </button>
            </div>
          )}

          {/* ── CONFIRM: start on-the-way ────────────── */}
          {outlet.visit_status === 'inactive' && action === 'onTheWay' && (
            <div className="space-y-3">
              <button onClick={() => setAction(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                ← Kembali
              </button>
              <div className="bg-blue-50 rounded-2xl p-4 space-y-1">
                <p className="text-sm font-semibold text-blue-800">Konfirmasi Perjalanan</p>
                <p className="text-xs text-blue-600">Sistem akan mencatat waktu keberangkatan Anda</p>
              </div>
              <button
                onClick={() => handleAction('onTheWay')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Bike size={18} />}
                Mulai Perjalanan
              </button>
            </div>
          )}

          {/* ── CONFIRM: direct checkin ──────────────── */}
          {outlet.visit_status === 'inactive' && action === 'checkin' && (
            <div className="space-y-3">
              <button onClick={() => setAction(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                ← Kembali
              </button>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  <FileText size={12} className="inline mr-1" />
                  Catatan Kunjungan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Kondisi outlet, keperluan kunjungan..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <button
                onClick={() => handleAction('checkin')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3.5 rounded-2xl hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                Check In Sekarang
              </button>
            </div>
          )}

          {/* ── CHECKIN: checkout form ───────────────── */}
          {outlet.visit_status === 'checkin' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5">
                <Clock size={16} className="animate-pulse" />
                <span className="text-sm font-medium">
                  Check in pukul {outlet.checkin_time || '-'}
                </span>
              </div>

              {/* Status toggle */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Status Kunjungan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'checkout', label: 'Selesai Kunjungan', icon: CheckCheck, color: 'emerald' },
                    { value: 'completed', label: 'Selesai + Ada Order', icon: Star, color: 'green' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCheckoutStatus(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        checkoutStatus === opt.value
                          ? `border-${opt.color}-400 bg-${opt.color}-50 text-${opt.color}-700`
                          : 'border-gray-100 bg-gray-50 text-gray-500'
                      }`}
                    >
                      <opt.icon size={18} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  <FileText size={12} className="inline mr-1" />
                  Catatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Hasil kunjungan, informasi penting..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  <Camera size={12} className="inline mr-1" />
                  URL Foto (Opsional)
                </label>
                <input
                  type="url"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <button
                onClick={() => handleAction('checkout')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3.5 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                Check Out Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Outlet Card ─────────────────────────────────────────────────────────────
function OutletCard({ outlet, onAction, onDetail }) {
  const status = outlet.visit_status;
  const isDone = ['checkout', 'completed', 'cancelled', 'closed'].includes(status);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${
        status === 'checkin'
          ? 'border-amber-300'
          : status === 'on-the-way'
          ? 'border-blue-300'
          : 'border-gray-100'
      }`}
    >
      {/* Active indicator bar */}
      {(status === 'checkin' || status === 'on-the-way') && (
        <div
          className={`h-1 w-full ${
            status === 'checkin' ? 'bg-amber-400' : 'bg-blue-500'
          }`}
        />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Route order badge */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              isDone
                ? 'bg-gray-100 text-gray-400'
                : status === 'checkin'
                ? 'bg-amber-100 text-amber-700'
                : status === 'on-the-way'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-blue-600 text-white'
            }`}
          >
            {isDone ? <CheckCheck size={14} /> : outlet.route_order}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                  {outlet.outlet_name}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{outlet.address}</p>
              </div>
              <SegBadge seg={outlet.segmentation_label} />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={status} />
              {outlet.days_since_last_visit !== undefined && (
                <span className="text-[11px] text-gray-400">
                  <Clock size={10} className="inline mr-0.5" />
                  {outlet.days_since_last_visit === 0
                    ? 'Dikunjungi hari ini'
                    : `${outlet.days_since_last_visit} hari lalu`}
                </span>
              )}
            </div>

            {/* Checkin/Checkout times */}
            {(outlet.checkin_time || outlet.checkout_time) && (
              <div className="flex items-center gap-3 mt-1.5">
                {outlet.checkin_time && (
                  <span className="text-[11px] text-amber-600">
                    ↗ {outlet.checkin_time}
                  </span>
                )}
                {outlet.checkout_time && (
                  <span className="text-[11px] text-emerald-600">
                    ↙ {outlet.checkout_time}
                  </span>
                )}
                {outlet.visit_duration_minutes > 0 && (
                  <span className="text-[11px] text-gray-400">
                    ({outlet.visit_duration_minutes} mnt)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          {/* Detail link */}
          <button
            onClick={() => onDetail(outlet.outlet_id)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
          >
            Detail <ChevronRight size={12} />
          </button>

          <div className="flex-1" />

          {/* Action buttons */}
          {status === 'inactive' && (
            <button
              onClick={() => onAction(outlet)}
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Bike size={13} />
              Mulai
            </button>
          )}
          {status === 'on-the-way' && (
            <button
              onClick={() => onAction(outlet)}
              className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-amber-600 active:scale-95 transition-all"
            >
              <LogIn size={13} />
              Check In
            </button>
          )}
          {status === 'checkin' && (
            <button
              onClick={() => onAction(outlet)}
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <LogOut size={13} />
              Check Out
            </button>
          )}
          {status === 'completed' && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
              <CheckCircle2 size={14} /> Selesai
            </span>
          )}
          {status === 'checkout' && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCheck size={14} /> Checkout
            </span>
          )}
          {status === 'cancelled' && (
            <button
              onClick={() => onAction(outlet)}
              className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-xl hover:border-primary hover:text-primary transition-colors"
            >
              Mulai Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MobileHomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    outlets,
    summary,
    routeDate,
    isLoadingOutlets,
    error,
    successMessage,
    clearMessages,
    fetchOutletIndex,
  } = useMobileVisitStore();

  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const salesmanId = user?.salesman_id || user?.id || '';
  const firstName = (user?.name || user?.full_name || user?.username || 'Sales').split(' ')[0];

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    fetchOutletIndex();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(clearMessages, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const filteredOutlets = outlets.filter((o) => {
    const matchSearch =
      !searchTerm ||
      o.outlet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || o.visit_status === filterStatus;
    return matchSearch && matchFilter;
  });

  const progressPercent =
    summary && summary.total > 0
      ? Math.round(((summary.visited || 0) / summary.total) * 100)
      : 0;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-blue-600 px-5 pt-3 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-blue-200 text-xs">Halo, Selamat bekerja 👋</p>
            <h1 className="text-white text-lg font-bold leading-tight">{firstName}</h1>
          </div>
          <button
            onClick={() => fetchOutletIndex()}
            disabled={isLoadingOutlets}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:bg-white/30 transition-colors"
          >
            <RefreshCw size={16} className={isLoadingOutlets ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-blue-200 text-xs mt-0.5">{todayStr}</p>

        {/* Progress bar */}
        {summary && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white text-xs font-semibold">Progress Rute</span>
              <span className="text-white text-xs font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="px-4 -mt-4">
          <div className="flex gap-2">
            <SummaryCard label="Total Rute" value={summary.total} color="text-gray-800" />
            <SummaryCard label="Dikunjungi" value={summary.visited} color="text-emerald-600" />
            <SummaryCard label="Berjalan" value={summary.ongoing} color="text-amber-600" />
            <SummaryCard label="Tersisa" value={summary.remaining} color="text-primary" />
          </div>
        </div>
      )}

      {/* Toasts */}
      {error && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={clearMessages}><X size={14} /></button>
        </div>
      )}
      {successMessage && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          <CheckCircle2 size={15} className="flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Search + filter */}
      <div className="px-4 mt-4 space-y-2">
        <div className="relative">
          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama outlet atau alamat..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'inactive', label: 'Belum' },
            { value: 'on-the-way', label: 'Perjalanan' },
            { value: 'checkin', label: 'Checkin' },
            { value: 'completed', label: 'Selesai' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                filterStatus === f.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outlet list */}
      <div className="px-4 mt-3 pb-4 space-y-3">
        {isLoadingOutlets ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm text-gray-400">Memuat rute hari ini...</p>
          </div>
        ) : filteredOutlets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <MapPin size={36} className="text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">
              {searchTerm || filterStatus !== 'all' ? 'Tidak ada hasil' : 'Tidak ada rute hari ini'}
            </p>
            <p className="text-xs text-gray-300">
              {searchTerm || filterStatus !== 'all' ? 'Coba ubah filter' : 'Hubungi supervisor Anda'}
            </p>
          </div>
        ) : (
          filteredOutlets.map((outlet) => (
            <OutletCard
              key={outlet.outlet_id}
              outlet={outlet}
              onAction={(o) => { clearMessages(); setSelectedOutlet(o); }}
              onDetail={(id) => navigate(`/mobile/outlet/${id}`)}
            />
          ))
        )}
      </div>

      {/* Visit action bottom sheet — outlet is derived live from the store so
          the popup reflects any status changes that happen after opening. */}
      {selectedOutlet && (
        <VisitActionSheet
          outlet={outlets.find((o) => o.outlet_id === selectedOutlet.outlet_id) ?? selectedOutlet}
          salesmanId={salesmanId}
          onClose={() => setSelectedOutlet(null)}
        />
      )}
    </div>
  );
}
