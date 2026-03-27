import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8356;

export default function LocationPickerMap({ lat, lng, onPositionChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current || mapRef.current) return;

      const initLat = lat || DEFAULT_LAT;
      const initLng = lng || DEFAULT_LNG;

      const map = L.map(mapContainerRef.current).setView([initLat, initLng], 14);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const pinIcon = L.icon({
        iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#1D4ED8"/>
            <circle cx="16" cy="16" r="7" fill="white"/>
            <circle cx="16" cy="16" r="4" fill="#1D4ED8"/>
          </svg>
        `)}`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([initLat, initLng], { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPositionChange(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onPositionChange(e.latlng.lat, e.latlng.lng);
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker when lat/lng changes from outside (e.g. geolocation)
  useEffect(() => {
    if (!markerRef.current || !mapRef.current || !lat || !lng) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], 16);
  }, [lat, lng]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
