import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import LocationPickerMap from '../components/Map/LocationPickerMap';
import useVisitationStore from '../store/visitationStore';

export default function UpdateLocationPage() {
  const { groups, isLoadingGroups, fetchGroups, updateLocation } = useVisitationStore();

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSalesmanId, setSelectedSalesmanId] = useState('');
  const [lat, setLat] = useState(-6.2088);
  const [lng, setLng] = useState(106.8356);
  const [accuracy, setAccuracy] = useState(10);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (groups.length === 0) fetchGroups();
  }, []);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const salesmans = selectedGroup?.salesmans || [];

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
    setSelectedSalesmanId('');
    setResult(null);
  };

  const handleSalesmanChange = (e) => {
    setSelectedSalesmanId(e.target.value);
    setResult(null);
  };

  const handlePositionChange = (newLat, newLng) => {
    setLat(parseFloat(newLat.toFixed(6)));
    setLng(parseFloat(newLng.toFixed(6)));
    setResult(null);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung geolocation');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(6)));
        setLng(parseFloat(pos.coords.longitude.toFixed(6)));
        setAccuracy(Math.round(pos.coords.accuracy));
        setIsGettingLocation(false);
        setResult(null);
      },
      () => {
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSalesmanId) return;

    setIsSubmitting(true);
    setResult(null);
    const res = await updateLocation(selectedSalesmanId, lat, lng, accuracy);
    setResult(res);
    setIsSubmitting(false);
  };

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col p-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <MapPin size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Update Lokasi Salesman</h2>
          <p className="text-xs text-gray-500">Pilih salesman dan pin lokasi di peta</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Form panel */}
        <div className="w-[300px] flex-shrink-0 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Group select */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Group Salesman
              </label>
              {isLoadingGroups ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader2 size={14} className="animate-spin" />
                  Memuat group...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedGroupId}
                    onChange={handleGroupChange}
                    className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                  >
                    <option value="">Pilih group...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Salesman select */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Salesman</label>
              <div className="relative">
                <select
                  value={selectedSalesmanId}
                  onChange={handleSalesmanChange}
                  disabled={!selectedGroupId}
                  className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Pilih salesman...</option>
                  {salesmans.map((sm) => (
                    <option key={sm.id} value={sm.id}>
                      {sm.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Koordinat */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Koordinat</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Latitude</p>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Longitude</p>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Accuracy */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Akurasi (meter)
              </label>
              <input
                type="number"
                min="1"
                value={accuracy}
                onChange={(e) => setAccuracy(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Geolocation hint */}
            <p className="text-xs text-gray-400">
              Klik pada peta atau drag marker untuk memilih lokasi, atau gunakan lokasi saat ini.
            </p>

            {/* Result */}
            {result && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  result.success
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <span className="flex-shrink-0">✕</span>
                )}
                <span>
                  {result.success
                    ? `Lokasi berhasil diupdate`
                    : result.message || 'Gagal update lokasi'}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isGettingLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {isGettingLocation ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Navigation size={16} />
              )}
              {isGettingLocation ? 'Mencari lokasi...' : 'Gunakan Lokasi Saya'}
            </button>

            <button
              onClick={handleSubmit}
              disabled={!selectedSalesmanId || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-800 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MapPin size={16} />
              )}
              {isSubmitting ? 'Menyimpan...' : 'Update Lokasi'}
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <LocationPickerMap lat={lat} lng={lng} onPositionChange={handlePositionChange} />
        </div>
      </div>
    </div>
  );
}
