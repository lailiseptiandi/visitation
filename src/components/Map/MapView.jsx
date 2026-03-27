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
  'active': 'Sudah Dikunjungi',
  'visiting': 'Sedang Dikunjungi',
  'on-the-way': 'Dalam Perjalanan',
  'inactive': 'Belum Dikunjungi',
};

function createNumberedMarkerIcon(color, number) {
  const fontSize = number >= 10 ? '11' : '13';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="16" y="20.5" text-anchor="middle" font-size="${fontSize}" font-weight="700" fill="white" font-family="Inter, Arial, sans-serif">${number}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildPopupContent(outlet, number, color) {
  const segLabel = outlet.segmentation_label || '-';
  const freqLabel = outlet.visit_frequency_label || '-';
  const status = statusLabel[outlet.status] || outlet.status || '-';
  const lastVisit = outlet.last_visit_date
    ? new Date(outlet.last_visit_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Belum pernah';
  const daysSince = outlet.days_since_last_visit != null ? `${outlet.days_since_last_visit} hari lalu` : '-';
  const visitDuration = outlet.visit_duration ? `${outlet.visit_duration} menit` : null;

  const rows = [
    ['Segmentasi', segLabel],
    ['Jadwal Kunjungan', freqLabel],
    visitDuration ? ['Durasi Kunjungan', visitDuration] : null,
    ['Kunjungan Terakhir', lastVisit],
    ['Sejak Kunjungan', daysSince],
    ['Status', `<span style="color:${color};font-weight:600;">${status}</span>`],
    ['Dikunjungi oleh', outlet.salesman_name || '-'],
  ].filter(Boolean);

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <div style="display:contents;">
        <span style="color:#9CA3AF;white-space:nowrap;">${label}</span>
        <span style="color:#374151;font-weight:500;">${value}</span>
      </div>`
    )
    .join('');

  return `
    <div style="min-width:240px;font-family:Inter,sans-serif;padding:2px 0;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <div style="width:24px;height:24px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="color:white;font-size:11px;font-weight:700;">${number}</span>
        </div>
        <div style="font-size:14px;font-weight:700;color:#111827;">${outlet.outlet_name || ''}</div>
      </div>
      <div style="font-size:12px;color:#6B7280;margin-bottom:10px;padding-left:32px;">${outlet.address || ''}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:12px;padding-left:8px;">
        ${rowsHtml}
      </div>
    </div>
  `;
}

export default function MapView({ outlets = [], isLoading = false, route = null }) {
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

      // Sort outlets by route order if route is available
      let orderedOutlets = [...outlets];
      if (route?.route?.length > 0) {
        const orderMap = {};
        route.route.forEach((r) => {
          orderMap[r.outlet_name] = r.order;
        });
        const inRoute = orderedOutlets
          .filter((o) => orderMap[o.outlet_name] !== undefined)
          .sort((a, b) => orderMap[a.outlet_name] - orderMap[b.outlet_name]);
        const outOfRoute = orderedOutlets.filter((o) => orderMap[o.outlet_name] === undefined);
        orderedOutlets = [...inRoute, ...outOfRoute];
      }

      const bounds = [];

      orderedOutlets.forEach((outlet, idx) => {
        const lat = outlet.latitude;
        const lng = outlet.longitude;
        if (!lat || !lng) return;

        const color = statusColorMap[outlet.status] || statusColorMap.default;
        const number = idx + 1;

        const icon = L.icon({
          iconUrl: createNumberedMarkerIcon(color, number),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        markersRef.current.push(marker);
        bounds.push([lat, lng]);

        marker.bindPopup(buildPopupContent(outlet, number, color), { maxWidth: 280 });
      });

      // Draw route polyline connecting outlets in order
      if (bounds.length > 1) {
        const polyline = L.polyline(bounds, {
          color: '#1D4ED8',
          weight: 2.5,
          opacity: 0.7,
          dashArray: '8, 6',
        }).addTo(map);
        markersRef.current.push(polyline);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    updateMarkers();
  }, [outlets, route]);

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
