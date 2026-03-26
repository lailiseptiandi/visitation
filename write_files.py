import os

base = '/Users/kangjamil/aha.id-visitation/frontend/src'

# MapView.jsx
mapview = r"""import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const statusColorMap = {
  'active': '#16A34A',
  'visiting': '#2563EB',
  'on-the-way': '#D97706',
  'inactive': '#9CA3AF',
  'default': '#1D4ED8',
};

const statusLabel = {
  'active': 'Aktif',
  'visiting': 'Sedang Dikunjungi',
  'on-the-way': 'Dalam Perjalanan',
  'inactive': 'Tidak Aktif',
};

function createMarkerIcon(color) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>
  `)}`;
}

export default function MapView({ outlets = [], isLoading = false }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current).setView([-6.2088, 106.8356], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function updateMarkers() {
      const L = await import('leaflet');
      const map = mapRef.current;
      if (!map) return;

      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      if (outlets.length === 0) return;

      const bounds = [];

      outlets.forEach((outlet) => {
        const lat = outlet.latitude;
        const lng = outlet.longitude;
        if (!lat || !lng) return;

        const color = statusColorMap[outlet.status] || statusColorMap.default;
        const icon = L.icon({
          iconUrl: createMarkerIcon(color),
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        markersRef.current.push(marker);
        bounds.push([lat, lng]);

        const freqLabel = outlet.visit_frequency_label || '-';
        const segLabel = outlet.segmentation_label || '-';
        const lastVisit = outlet.last_visit_date || 'Belum pernah';
        const daysOverdue = outlet.days_since_last_visit || 0;

        marker.bindPopup(`
          <div style="min-width: 220px; font-family: Inter, sans-serif;">
            <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 8px 0; color: #111827;">${outlet.outlet_name || ''}</h3>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">📍 ${outlet.address || ''}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">🏷️ ${segLabel}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">📅 Frekuensi: ${freqLabel}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">👤 SM: ${outlet.salesman_name || '-'}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">🕐 Kunjungan terakhir: ${lastVisit}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">⏳ ${daysOverdue} hari sejak kunjungan terakhir</div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; background: ${color}20; font-size: 11px; font-weight: 500; color: ${color};">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
              ${statusLabel[outlet.status] || outlet.status || 'Unknown'}
            </div>
          </div>
        `);
      });

      if (bounds.length > 1) {
        const polyline = L.polyline(bounds, {
          color: '#1D4ED8',
          weight: 2,
          opacity: 0.6,
          dashArray: '8, 8',
        }).addTo(map);
        markersRef.current.push(polyline);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    updateMarkers();
  }, [outlets]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[1000]">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-sm text-gray-600">Memuat outlet...</span>
          </div>
        </div>
      )}
      {!isLoading && outlets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none">
          <div className="bg-white/90 px-6 py-4 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-sm text-gray-500">Pilih salesman untuk melihat outlet di peta</p>
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open(os.path.join(base, 'components/Map/MapView.jsx'), 'w') as f:
    f.write(mapview)
print('MapView.jsx written')

# VisitationPlanPage.jsx
visitpage = r"""import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import MapView from '../components/Map/MapView';
import useVisitationStore from '../store/visitationStore';

const statsCards = [
  { label: 'Total Target Hari Ini', value: 'Rp 12.500.000', icon: Target, color: 'text-primary bg-blue-50' },
  { label: 'SM Aktif', value: '8', icon: Users, color: 'text-success bg-green-50' },
  { label: 'Outlet Selesai', value: '24 / 40', icon: CheckCircle2, color: 'text-warning bg-amber-50' },
  { label: 'Realisasi Order', value: 'Rp 8.750.000', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
];

export default function VisitationPlanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const {
    groups,
    outlets,
    selectedSalesmanId,
    isLoadingGroups,
    isLoadingOutlets,
    fetchGroups,
    selectSalesman,
  } = useVisitationStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (groups.length > 0 && expandedGroups.length === 0) {
      setExpandedGroups(groups.map((g) => g.id));
    }
  }, [groups]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

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
                          onClick={() => selectSalesman(sm.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            selectedSalesmanId === sm.id ? 'bg-blue-50 border-l-2 border-primary' : ''
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
          <MapView outlets={outlets} isLoading={isLoadingOutlets} />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
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
            className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm hover:bg-gray-50 transition-colors"
            title="Pengaturan"
          >
            <Settings size={18} className="text-gray-600" />
          </button>

          {/* Settings Panel */}
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        </div>
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
    <div className="absolute top-4 right-4 w-72 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Pengaturan</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
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
          {saved ? '\u2713 Tersimpan!' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}
"""

with open(os.path.join(base, 'pages/VisitationPlanPage.jsx'), 'w') as f:
    f.write(visitpage)
print('VisitationPlanPage.jsx written')

print('All files updated!')
