import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Package,
  User,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Star,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import useMobileVisitStore from '../../store/mobileVisitStore';

const STATUS_CONFIG = {
  inactive: { label: 'Belum Dikunjungi', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  'on-the-way': { label: 'Dalam Perjalanan', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  checkin: { label: 'Sedang Kunjungan', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  checkout: { label: 'Selesai Kunjungan', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { label: 'Selesai + Order', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-600' },
  cancelled: { label: 'Dibatalkan', bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
};

const SEG_CONFIG = {
  Gold: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🥇' },
  Silver: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: '🥈' },
  Bronze: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🥉' },
};

const DAY_NAMES = ['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value || value === '-') return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function OutletDetailPage() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  const {
    outletDetail,
    outletOrders,
    outletOrdersMeta,
    isLoadingDetail,
    isLoadingOrders,
    error,
    fetchOutletDetail,
    fetchOutletOrders,
  } = useMobileVisitStore();

  useEffect(() => {
    if (outletId) {
      fetchOutletDetail(outletId);
    }
  }, [outletId]);

  useEffect(() => {
    if (activeTab === 'orders' && outletId && outletOrders.length === 0) {
      fetchOutletOrders(outletId);
    }
  }, [activeTab, outletId]);

  if (isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm text-gray-400">Memuat detail outlet...</p>
      </div>
    );
  }

  if (!outletDetail && !isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-8">
        <AlertCircle size={36} className="text-red-300" />
        <p className="text-base font-semibold text-gray-600 text-center">Outlet tidak ditemukan</p>
        <p className="text-sm text-gray-400 text-center">{error || 'Coba ulangi atau kembali'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          Kembali
        </button>
      </div>
    );
  }

  const d = outletDetail;
  const seg = d?.segmentation_label;
  const segCfg = SEG_CONFIG[seg] || SEG_CONFIG.Silver;
  const status = d?.visit_status;

  const openDays = (d?.operating_hours || []).filter((h) => h.is_open);
  const closedDays = (d?.operating_hours || []).filter((h) => !h.is_open);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-blue-600 px-5 pt-2 pb-16">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white font-bold text-base flex-1 truncate">Detail Outlet</h1>
        </div>
      </div>

      {/* Main card — overlaps header */}
      <div className="px-4 -mt-12 space-y-3">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 leading-tight">{d?.outlet_name}</p>
              <p className="text-sm text-gray-400 mt-1">{d?.address}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border ${segCfg.bg} ${segCfg.text} ${segCfg.border} flex-shrink-0`}
            >
              {segCfg.icon} {seg}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status && <StatusBadge status={status} />}
            {d?.visit_frequency && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                <Calendar size={10} className="inline mr-1" />
                {d.visit_frequency}
              </span>
            )}
          </div>

          {/* Scheduled visit */}
          {d?.scheduled_visit?.start_time && (
            <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <p className="text-xs text-blue-700 font-medium">
                Jadwal kunjungan: {d.scheduled_visit.start_time} – {d.scheduled_visit.end_time}
                {' '}({d.scheduled_visit.duration_minutes} mnt)
              </p>
            </div>
          )}

          {/* Open in maps */}
          {d?.latitude && d?.longitude && (
            <a
              href={`https://maps.google.com/?q=${d.latitude},${d.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 border border-primary/30 text-primary text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <MapPin size={15} />
              Buka di Google Maps
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'info', label: 'Informasi' },
              { id: 'hours', label: 'Jam Buka' },
              { id: 'orders', label: 'Pesanan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4 py-2">
            {/* Info tab */}
            {activeTab === 'info' && (
              <div>
                <InfoRow icon={User} label="Nama Pemilik / Kontak" value={d?.customer_name} />
                <InfoRow icon={Phone} label="Nomor Telepon" value={d?.phone_number} />
                <InfoRow icon={MapPin} label="Alamat Lengkap" value={d?.address} />
                <InfoRow icon={User} label="Salesman" value={d?.salesman_name} />
                <InfoRow icon={Users} label="Tim / Grup" value={d?.group_salesman_name} />
                <InfoRow icon={Star} label="Segmentasi" value={d?.segmentation_label} />
                <InfoRow icon={Calendar} label="Frekuensi Kunjungan" value={d?.visit_frequency} />
              </div>
            )}

            {/* Hours tab */}
            {activeTab === 'hours' && (
              <div className="py-2 space-y-1">
                {(d?.operating_hours || []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Jam operasional tidak tersedia
                  </p>
                ) : (
                  (d?.operating_hours || []).map((h) => (
                    <div
                      key={h.day_of_week}
                      className={`flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 ${
                        !h.is_open ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
                            h.is_open ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {DAY_NAMES[h.day_of_week]}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{h.day_name}</span>
                      </div>
                      {h.is_open ? (
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-700">
                            {h.open_time} – {h.close_time}
                          </p>
                          {h.break_time_start && (
                            <p className="text-[10px] text-gray-400">
                              Istirahat {h.break_time_start}–{h.break_time_end}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Tutup</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div className="py-2">
                {isLoadingOrders ? (
                  <div className="flex items-center justify-center py-10 gap-2">
                    <Loader2 size={20} className="animate-spin text-primary" />
                    <span className="text-sm text-gray-400">Memuat pesanan...</span>
                  </div>
                ) : outletOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <ShoppingBag size={32} className="text-gray-200" />
                    <p className="text-sm text-gray-400">Belum ada pesanan</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {outletOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{order.order_number}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' · '}
                            {order.payment_method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{order.total_amount}</p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {outletOrdersMeta && outletOrdersMeta.pages > 1 && (
                      <button
                        onClick={() => fetchOutletOrders(outletId, 2)}
                        className="w-full text-center text-xs text-primary font-semibold py-2"
                      >
                        Muat lebih banyak
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
