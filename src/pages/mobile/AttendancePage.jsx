import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
  CheckCheck,
  X,
  LogIn,
  LogOut,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import useMobileVisitStore from '../../store/mobileVisitStore';

const STATUS_CONFIG = {
  inactive: { label: 'Belum', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', icon: Clock },
  'on-the-way': { label: 'Perjalanan', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', icon: LogIn },
  checkin: { label: 'Kunjungan', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: LogIn },
  checkout: { label: 'Selesai', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCheck },
  completed: { label: 'Selesai+Order', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-600', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', icon: XCircle },
};

const SEG_CONFIG = {
  Gold: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🥇' },
  Silver: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: '🥈' },
  Bronze: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🥉' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SummaryCard({ label, value, color, icon: Icon }) {
  return (
    <div className="flex-1 bg-white rounded-xl p-3 text-center shadow-sm">
      <div className={`w-8 h-8 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100')} flex items-center justify-center mx-auto mb-1.5`}>
        <Icon size={15} className={color} />
      </div>
      <p className={`text-lg font-bold ${color}`}>{value ?? '-'}</p>
      <p className="text-[10px] text-gray-400 font-medium leading-tight">{label}</p>
    </div>
  );
}

function VisitCard({ visit }) {
  const cfg = STATUS_CONFIG[visit.visit_status] || STATUS_CONFIG.inactive;
  const segCfg = SEG_CONFIG[visit.segmentation_label] || SEG_CONFIG.Silver;
  const isDone = ['checkout', 'completed'].includes(visit.visit_status);

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border ${isDone ? 'border-gray-100' : 'border-amber-200'}`}>
      {isDone && (
        <div className={`h-1 ${visit.visit_status === 'completed' ? 'bg-green-500' : 'bg-emerald-400'}`} />
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <cfg.icon size={16} className={cfg.text} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{visit.outlet_name}</p>
                <p className="text-xs text-gray-400 truncate">{visit.address}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border flex-shrink-0 ${segCfg.bg} ${segCfg.text} ${segCfg.border}`}>
                {segCfg.icon}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={visit.visit_status} />
              {visit.order_count > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <ShoppingBag size={10} />
                  {visit.order_count} order
                </span>
              )}
            </div>

            {/* Time info */}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-50">
              {visit.checkin_time && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-gray-500">Masuk:</span>
                  <span className="font-semibold text-amber-700">{visit.checkin_time}</span>
                </div>
              )}
              {visit.checkout_time && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-gray-500">Keluar:</span>
                  <span className="font-semibold text-emerald-700">{visit.checkout_time}</span>
                </div>
              )}
              {visit.duration_minutes > 0 && (
                <span className="text-xs text-gray-400 ml-auto">
                  {visit.duration_minutes} mnt
                </span>
              )}
            </div>

            {/* Notes */}
            {visit.visit_note && (
              <p className="mt-1.5 text-xs text-gray-500 italic bg-gray-50 px-2 py-1.5 rounded-lg">
                "{visit.visit_note}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { attendance, isLoadingAttendance, error, fetchAttendance, clearMessages } = useMobileVisitStore();

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const s = attendance?.summary;
  const visits = attendance?.visits || [];

  const completedVisits = visits.filter((v) => ['checkout', 'completed'].includes(v.visit_status));
  const ongoingVisits = visits.filter((v) => v.visit_status === 'checkin');
  const otherVisits = visits.filter((v) => !['checkout', 'completed', 'checkin'].includes(v.visit_status));

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-blue-600 px-5 pt-3 pb-14">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white text-lg font-bold">Absensi Kunjungan</h1>
          <button
            onClick={() => fetchAttendance(selectedDate)}
            disabled={isLoadingAttendance}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <RefreshCw size={15} className={isLoadingAttendance ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Date selector */}
        <div className="mt-3">
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/10 text-white text-sm font-semibold rounded-xl px-3 py-2 border border-white/20 focus:bg-white/20 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-4 -mt-8 space-y-3">
        {s && (
          <div className="flex gap-2">
            <SummaryCard label="Total Rute" value={s.total_route_outlets} color="text-gray-700" icon={MapPin} />
            <SummaryCard label="Selesai" value={s.visited} color="text-emerald-600" icon={CheckCheck} />
            <SummaryCard label="Berjalan" value={s.ongoing} color="text-amber-600" icon={Clock} />
            <SummaryCard label="Dibatalkan" value={s.cancelled} color="text-red-500" icon={XCircle} />
          </div>
        )}

        {/* Error */}
        {error && !isLoadingAttendance && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={clearMessages}><X size={14} /></button>
          </div>
        )}

        {isLoadingAttendance && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm text-gray-400">Memuat absensi...</p>
          </div>
        )}

        {!isLoadingAttendance && (
          <div className="space-y-4">
            {/* Total visits stats bar */}
            {s && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">Rekap Hari Ini</p>
                  <p className="text-xs text-gray-400">
                    {new Date(selectedDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: s.total_route_outlets > 0
                        ? `${Math.round((s.visited / s.total_route_outlets) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400">
                    {s.visited} dari {s.total_route_outlets} outlet dikunjungi
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {s.total_route_outlets > 0
                      ? `${Math.round((s.visited / s.total_route_outlets) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            )}

            {/* Currently ongoing */}
            {ongoingVisits.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Sedang Berjalan ({ongoingVisits.length})
                </p>
                <div className="space-y-2">
                  {ongoingVisits.map((v) => <VisitCard key={v.visit_id} visit={v} />)}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedVisits.length > 0 && (
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Selesai ({completedVisits.length})
                </p>
                <div className="space-y-2">
                  {completedVisits.map((v) => <VisitCard key={v.visit_id} visit={v} />)}
                </div>
              </div>
            )}

            {/* Others (cancelled etc) */}
            {otherVisits.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  Lainnya ({otherVisits.length})
                </p>
                <div className="space-y-2">
                  {otherVisits.map((v) => <VisitCard key={v.visit_id} visit={v} />)}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoadingAttendance && visits.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <ClipboardCheck size={40} className="text-gray-200" />
                <p className="text-sm font-semibold text-gray-400">Belum ada kunjungan</p>
                <p className="text-xs text-gray-300">untuk tanggal ini</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
