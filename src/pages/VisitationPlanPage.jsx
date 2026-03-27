import { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  Target,
  CheckCircle2,
  DollarSign,
  Settings,
  Loader2,
  Route,
  X,
  Sparkles,
} from 'lucide-react';
import MapView from '../components/Map/MapView';
import useVisitationStore from '../store/visitationStore';

export default function VisitationPlanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);

  const {
    groups,
    outlets,
    summary,
    route,
    selectedSalesmanId,
    selectedGroupId,
    isLoadingGroups,
    isLoadingOutlets,
    isGeneratingRoute,
    fetchGroups,
    selectSalesman,
    generateRoute,
  } = useVisitationStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (groups.length > 0 && expandedGroups.length === 0) {
      setExpandedGroups(groups.map((g) => g.id));
    }
  }, [groups]);

  useEffect(() => {
    if (route) setShowRoutePanel(true);
  }, [route]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      salesmans: (group.salesmans || []).filter((sm) =>
        sm.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.salesmans.length > 0);

  const handleGenerateRoute = () => {
    if (selectedSalesmanId && selectedGroupId) {
      generateRoute(selectedSalesmanId, selectedGroupId);
    }
  };

  const statsCards = [
    {
      label: 'Target Harian',
      value: summary ? summary.daily_target : '-',
      icon: Target,
      color: 'text-primary bg-blue-50',
    },
    {
      label: 'SM Aktif',
      value: summary ? summary.active_salesman : '-',
      icon: Users,
      color: 'text-success bg-green-50',
    },
    {
      label: 'Outlet Selesai',
      value: summary ? `${summary.outlet_completed} / ${summary.outlet_total}` : '-',
      icon: CheckCircle2,
      color: 'text-warning bg-amber-50',
    },
    {
      label: 'Realisasi Order',
      value: summary ? summary.order_realization : '-',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-sm font-semibold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-4">
        {/* Salesman sidebar */}
        <div className="w-[260px] flex-shrink-0 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari salesman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Generate Route button */}
          {selectedSalesmanId && (
            <div className="px-3 py-2 border-b border-gray-100">
              <button
                onClick={handleGenerateRoute}
                disabled={isGeneratingRoute}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-blue-800 disabled:bg-blue-300 text-white text-xs font-medium rounded-lg transition-colors"
              >
                {isGeneratingRoute ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {isGeneratingRoute ? 'Generating...' : 'Generate Route AI'}
              </button>
            </div>
          )}

          {/* Group list */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                Tidak ada data salesman
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
                  >
                    {expandedGroups.includes(group.id) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    {group.name}
                    <span className="ml-auto text-gray-400 normal-case font-normal">
                      {group.salesmans?.length || 0}
                    </span>
                  </button>

                  {expandedGroups.includes(group.id) && (
                    <div className="pb-1">
                      {(group.salesmans || []).map((sm) => (
                        <button
                          key={sm.id}
                          onClick={() => selectSalesman(sm.id, group.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            selectedSalesmanId === sm.id
                              ? 'bg-blue-50 border-l-2 border-primary'
                              : ''
                          }`}
                        >
                          <div className="relative">
                            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {sm.name.charAt(0)}
                              </span>
                            </div>
                            {sm.progress > 0 && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{sm.name}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {sm.progress}/{sm.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden relative">
          <MapView outlets={outlets} isLoading={isLoadingOutlets} route={route} />

          {/* SM Info Card */}
          {selectedSalesmanId && (() => {
            const selectedSM = groups
              .flatMap((g) => (g.salesmans || []).map((sm) => ({ ...sm, groupName: g.name })))
              .find((sm) => sm.id === selectedSalesmanId);
            if (!selectedSM) return null;
            return (
              <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg border border-gray-200 shadow-md p-3 w-56">
                <p className="text-sm font-semibold text-gray-900 mb-2">{selectedSM.name}</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                  <div>
                    <p className="text-gray-400">Group SM</p>
                    <p className="font-medium text-gray-700">{selectedSM.groupName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Outlet Dikunjungi</p>
                    <p className="font-medium text-gray-700">{selectedSM.progress}/{selectedSM.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Jam Kerja</p>
                    <p className="font-medium text-gray-700">08:00 – 17:00</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Max Kunjungan</p>
                    <p className="font-medium text-gray-700">20 Outlet/hari</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 px-4 py-3 shadow-sm z-[1000]">
            <p className="text-xs font-semibold text-gray-700 mb-2">Legenda</p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500" /> Sudah
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> Sedang
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-500" /> Perjalanan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-400" /> Belum
              </span>
            </div>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm hover:bg-gray-50 transition-colors z-[1000]"
            title="Pengaturan"
          >
            <Settings size={18} className="text-gray-600" />
          </button>

          {/* Route panel button */}
          {route && !showRoutePanel && (
            <button
              onClick={() => setShowRoutePanel(true)}
              className="absolute top-4 right-4 flex items-center gap-2 bg-primary text-white text-xs font-medium px-3 py-2 rounded-lg shadow-sm hover:bg-blue-800 transition-colors z-[1000]"
            >
              <Route size={14} />
              Lihat Route AI
            </button>
          )}

          {/* Settings Panel */}
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

          {/* Route Panel */}
          {showRoutePanel && route && (
            <RoutePanel route={route} onClose={() => setShowRoutePanel(false)} />
          )}
        </div>
      </div>
    </div>
  );
}

function RoutePanel({ route, onClose }) {
  return (
    <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-32px)] bg-white rounded-lg border border-gray-200 shadow-lg z-[1000] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-gray-900">Route AI</h3>
          <span className="text-xs text-gray-400">{route.route?.length || 0} outlet</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {route.summary && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
          <p className="text-xs text-blue-700">{route.summary}</p>
        </div>
      )}

      <div className="overflow-y-auto flex-1">
        {(route.route || []).map((item) => (
          <div
            key={item.order}
            className="flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50"
          >
            <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.order}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.outlet_name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ onClose }) {
  const [maxVisit, setMaxVisit] = useState('10');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('17:00');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="absolute top-4 right-4 w-72 bg-white rounded-lg border border-gray-200 shadow-lg z-[1000]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Pengaturan</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
          &times;
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Maks. Kunjungan / Hari
          </label>
          <select
            value={maxVisit}
            onChange={(e) => setMaxVisit(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="5">5 Outlet</option>
            <option value="10">10 Outlet</option>
            <option value="15">15 Outlet</option>
            <option value="20">20 Outlet</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Jam Kerja Mulai</label>
          <input
            type="time"
            value={jamMulai}
            onChange={(e) => setJamMulai(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Jam Kerja Selesai</label>
          <input
            type="time"
            value={jamSelesai}
            onChange={(e) => setJamSelesai(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-blue-800 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {saved ? '✓ Tersimpan!' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}
