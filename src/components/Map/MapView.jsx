import { useEffect, useRef } from 'react';
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
