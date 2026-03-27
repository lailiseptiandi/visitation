import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Loader2,
  LogIn,
  LogOut,
  CheckCircle2,
  User,
  Store,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const statusBadge = {
  active:     { label: 'Sudah Dikunjungi', cls: 'bg-green-100 text-green-700' },
  visiting:   { label: 'Sedang Dikunjungi', cls: 'bg-blue-100 text-blue-700' },
  'on-the-way': { label: 'Dalam Perjalanan', cls: 'bg-amber-100 text-amber-700' },
  inactive:   { label: 'Belum Dikunjungi', cls: 'bg-gray-100 text-gray-600' },
};

const defaultOutletStatusPriority = ['visiting', 'on-the-way', 'inactive', 'active'];

function getOutletId(outlet) {
  return outlet?.outlet_id ?? outlet?.id ?? null;
}

function getDefaultOutlet(outletList) {
  if (!Array.isArray(outletList) || outletList.length === 0) {
    return null;
  }

  const prioritizedOutlet = defaultOutletStatusPriority
    .map((status) => outletList.find((outlet) => outlet.status === status))
    .find(Boolean);

  return prioritizedOutlet || outletList[0];
}

function JsonBlock({ value }) {
  return (
    <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-auto max-h-52 whitespace-pre-wrap break-all">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function StepBadge({ n, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        done ? 'bg-green-100' : active ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        {done ? <CheckCircle2 size={14} /> : n}
      </div>
      {label}
    </div>
  );
}

export default function VisitTestPage() {
  // --- data state ---
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);

  const [selectedSalesman, setSelectedSalesman] = useState(null); // {id, name}
  const [outlets, setOutlets] = useState([]);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [selectedOutlet, setSelectedOutlet] = useState(null); // outlet object

  // --- checkin form ---
  const [visitNote, setVisitNote] = useState('Kunjungan rutin');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null); // {success, data, error}

  // --- checkout form ---
  const [visitStatus, setVisitStatus] = useState('completed');
  const [checkoutNote, setCheckoutNote] = useState('Selesai, order masuk');
  const [visitPhoto, setVisitPhoto] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  // load groups on mount
  useEffect(() => {
    loadGroups();
  }, []);

  // auto-expand all groups
  useEffect(() => {
    if (groups.length > 0) {
      setExpandedGroups(groups.map((g) => g.id));
    }
  }, [groups]);

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await api.get('/visit-sales-outlet/group-salesman-list');
      setGroups(res.data?.data || []);
    } finally {
      setLoadingGroups(false);
    }
  };

  const selectSalesman = async (sm, groupId) => {
    setSelectedSalesman(sm);
    setSelectedGroupId(groupId);
    setSelectedOutlet(null);
    setCheckinResult(null);
    setCheckoutResult(null);
    setLoadingOutlets(true);
    try {
      const res = await api.get('/visit-sales-outlet/list', {
        params: { salesman_id: sm.id, group_salesman_id: groupId },
      });
      const nextOutlets = res.data?.data?.data || [];
      setOutlets(nextOutlets);
      setSelectedOutlet(getDefaultOutlet(nextOutlets));
    } finally {
      setLoadingOutlets(false);
    }
  };

  const handleCheckin = async () => {
    if (!selectedSalesman || !selectedOutlet) return;
    setCheckinLoading(true);
    setCheckinResult(null);
    setCheckoutResult(null);
    try {
      const res = await api.post('/visit-sales-outlet/visit/checkin', {
        salesman_id: selectedSalesman.id,
        outlet_id: getOutletId(selectedOutlet),
        latitude: selectedOutlet.latitude,
        longitude: selectedOutlet.longitude,
        visit_note: visitNote,
        visit_date: visitDate,
      });
      setCheckinResult({ success: true, data: res.data });
    } catch (err) {
      setCheckinResult({ success: false, error: err.response?.data || { message: err.message } });
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckout = async () => {
    const visitId = checkinResult?.data?.data?.id || checkinResult?.data?.id;
    if (!visitId) return;
    setCheckoutLoading(true);
    setCheckoutResult(null);
    try {
      const body = {
        visit_id: visitId,
        visit_status: visitStatus,
        latitude: selectedOutlet?.latitude,
        longitude: selectedOutlet?.longitude,
        visit_note: checkoutNote,
      };
      if (visitPhoto) body.visit_photo = visitPhoto;
      const res = await api.post('/visit-sales-outlet/visit/checkout', body);
      setCheckoutResult({ success: true, data: res.data });
    } catch (err) {
      setCheckoutResult({ success: false, error: err.response?.data || { message: err.message } });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const checkinDone = !!checkinResult?.success;
  const visitId = checkinResult?.data?.data?.id || checkinResult?.data?.id;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <ClipboardList size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Test Visit API</h1>
          <p className="text-sm text-gray-500">Uji coba checkin &amp; checkout salesman secara langsung</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-4 flex-wrap">
        <StepBadge n="1" label="Pilih Salesman" active={!selectedSalesman} done={!!selectedSalesman} />
        <ChevronRight size={14} className="text-gray-300" />
        <StepBadge n="2" label="Pilih Outlet" active={!!selectedSalesman && !selectedOutlet} done={!!selectedOutlet} />
        <ChevronRight size={14} className="text-gray-300" />
        <StepBadge n="3" label="Checkin" active={!!selectedOutlet && !checkinDone} done={checkinDone} />
        <ChevronRight size={14} className="text-gray-300" />
        <StepBadge n="4" label="Checkout" active={checkinDone && !checkoutResult?.success} done={!!checkoutResult?.success} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Salesman + Outlet picker */}
        <div className="lg:col-span-1 space-y-4">
          {/* Salesman picker */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <User size={15} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">Pilih Salesman</span>
              </div>
              <button onClick={loadGroups} disabled={loadingGroups} className="text-gray-400 hover:text-blue-600 transition-colors">
                <RefreshCw size={14} className={loadingGroups ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
              {loadingGroups ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                </div>
              ) : groups.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Tidak ada data</p>
              ) : (
                groups.map((group) => (
                  <div key={group.id}>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-50"
                      onClick={() =>
                        setExpandedGroups((prev) =>
                          prev.includes(group.id) ? prev.filter((g) => g !== group.id) : [...prev, group.id]
                        )
                      }
                    >
                      {expandedGroups.includes(group.id) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {group.name}
                      <span className="ml-auto font-normal text-gray-400 normal-case">{group.salesmans?.length || 0}</span>
                    </button>
                    {expandedGroups.includes(group.id) &&
                      (group.salesmans || []).map((sm) => (
                        <button
                          key={sm.id}
                          onClick={() => selectSalesman(sm, group.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                            selectedSalesman?.id === sm.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-600">{sm.name.charAt(0)}</span>
                          </div>
                          <span className="flex-1 text-left truncate text-gray-800">{sm.name}</span>
                          <span className="text-xs text-gray-400">{sm.progress}/{sm.count}</span>
                        </button>
                      ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outlet picker */}
          {selectedSalesman && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <Store size={15} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">Pilih Outlet</span>
                {!loadingOutlets && selectedOutlet && (
                  <span className="ml-auto text-[11px] font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    auto terpilih
                  </span>
                )}
                {loadingOutlets && <Loader2 size={13} className="animate-spin text-gray-400 ml-auto" />}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {loadingOutlets ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                  </div>
                ) : outlets.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">Tidak ada outlet</p>
                ) : (
                  outlets.map((outlet) => {
                    const badge = statusBadge[outlet.status] || statusBadge.inactive;
                    return (
                      <button
                        key={getOutletId(outlet) || `${outlet.outlet_name}-${outlet.salesman_id}`}
                        onClick={() => { setSelectedOutlet(outlet); setCheckinResult(null); setCheckoutResult(null); }}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                          getOutletId(selectedOutlet) === getOutletId(outlet) ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{outlet.outlet_name}</p>
                          <p className="text-xs text-gray-400 truncate">{outlet.address || '-'}</p>
                          <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Forms */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected info banner */}
          {selectedOutlet && (
            <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
              <div>
                <span className="text-blue-500 text-xs font-medium">Salesman</span>
                <p className="font-semibold text-blue-900">{selectedSalesman?.name}</p>
              </div>
              <div className="w-px h-8 bg-blue-200" />
              <div>
                <span className="text-blue-500 text-xs font-medium">Outlet</span>
                <p className="font-semibold text-blue-900">{selectedOutlet.outlet_name}</p>
              </div>
              <div className="w-px h-8 bg-blue-200" />
              <div>
                <span className="text-blue-500 text-xs font-medium">Koordinat</span>
                <p className="font-mono text-xs text-blue-700">{selectedOutlet.latitude}, {selectedOutlet.longitude}</p>
              </div>
            </div>
          )}

          {/* Checkin form */}
          <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${checkinDone ? 'border-green-200' : 'border-gray-200'}`}>
            <div className={`flex items-center gap-3 px-5 py-3 border-b ${checkinDone ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${checkinDone ? 'bg-green-100' : 'bg-blue-100'}`}>
                <LogIn size={14} className={checkinDone ? 'text-green-600' : 'text-blue-600'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Checkin</p>
                <p className="text-xs text-gray-400 font-mono">POST /visit-sales-outlet/visit/checkin</p>
              </div>
              {checkinDone && (
                <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Sukses</span>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">salesman_id</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600 truncate">
                    {selectedSalesman?.id || <span className="text-gray-400 italic">belum dipilih</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">outlet_id</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600 truncate">
                    {getOutletId(selectedOutlet) || <span className="text-gray-400 italic">belum dipilih</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">latitude</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600">
                    {selectedOutlet?.latitude ?? <span className="text-gray-400 italic">-</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">longitude</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600">
                    {selectedOutlet?.longitude ?? <span className="text-gray-400 italic">-</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">visit_date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    disabled={checkinDone}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">visit_note</label>
                  <input
                    type="text"
                    value={visitNote}
                    onChange={(e) => setVisitNote(e.target.value)}
                    disabled={checkinDone}
                    placeholder="Kunjungan rutin"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              {!checkinDone && (
                <button
                  onClick={handleCheckin}
                  disabled={!selectedOutlet || checkinLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {checkinLoading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
                  {checkinLoading ? 'Mengirim...' : 'Kirim Checkin'}
                </button>
              )}

              {checkinResult && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Response</p>
                  <JsonBlock value={checkinResult.success ? checkinResult.data : checkinResult.error} />
                  {visitId && (
                    <p className="mt-2 text-xs text-blue-600">
                      <span className="font-medium">visit_id:</span>{' '}
                      <code className="bg-blue-50 px-1.5 py-0.5 rounded font-mono">{visitId}</code>{' '}
                      <span className="text-gray-400">— sudah diisi otomatis ke form checkout</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Checkout form — hanya muncul setelah checkin sukses */}
          {checkinDone && (
            <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${checkoutResult?.success ? 'border-green-200' : 'border-gray-200'}`}>
              <div className={`flex items-center gap-3 px-5 py-3 border-b ${checkoutResult?.success ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${checkoutResult?.success ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <LogOut size={14} className={checkoutResult?.success ? 'text-green-600' : 'text-orange-600'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Checkout</p>
                  <p className="text-xs text-gray-400 font-mono">POST /visit-sales-outlet/visit/checkout</p>
                </div>
                {checkoutResult?.success && (
                  <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Sukses</span>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">visit_id (dari checkin)</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600 truncate">
                      {visitId}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">visit_status</label>
                    <select
                      value={visitStatus}
                      onChange={(e) => setVisitStatus(e.target.value)}
                      disabled={!!checkoutResult?.success}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="completed">completed</option>
                      <option value="checkout">checkout</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">visit_note</label>
                    <input
                      type="text"
                      value={checkoutNote}
                      onChange={(e) => setCheckoutNote(e.target.value)}
                      disabled={!!checkoutResult?.success}
                      placeholder="Selesai, order masuk"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      visit_photo <span className="text-gray-400 font-normal">(opsional, URL)</span>
                    </label>
                    <input
                      type="url"
                      value={visitPhoto}
                      onChange={(e) => setVisitPhoto(e.target.value)}
                      disabled={!!checkoutResult?.success}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                </div>

                {!checkoutResult?.success && (
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                    {checkoutLoading ? 'Mengirim...' : 'Kirim Checkout'}
                  </button>
                )}

                {checkoutResult && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Response</p>
                    <JsonBlock value={checkoutResult.success ? checkoutResult.data : checkoutResult.error} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!selectedOutlet && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 flex items-center justify-center py-16 text-center">
              <div>
                <ClipboardList size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Pilih salesman di sebelah kiri</p>
                <p className="text-xs text-gray-400 mt-1">Outlet akan dipilih otomatis jika data tersedia</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
