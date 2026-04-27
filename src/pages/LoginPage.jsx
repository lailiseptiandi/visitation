import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Smartphone } from 'lucide-react';
import useAuthStore from '../store/authStore';

const DEFAULT_IMEI = 'eae4d350cb18b85e';

export default function LoginPage() {
  const [username, setUsername] = useState('lailisalesgantenk');
  const [password, setPassword] = useState('');
  const [imei, setImei] = useState(DEFAULT_IMEI);
  const [showPassword, setShowPassword] = useState(false);
  const [showImei, setShowImei] = useState(false);
  const { loginMobile, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await loginMobile(username, password, imei);
    if (success) {
      navigate('/mobile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-4">
      <div className="w-full max-w-[390px]">
        {/* Phone frame simulation */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top gradient banner */}
          <div className="bg-gradient-to-b from-primary to-blue-600 px-6 pt-10 pb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-4 backdrop-blur-sm">
              <Smartphone size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Visitation Plan</h1>
            <p className="text-blue-200 text-sm mt-1">Salesman Mobile App</p>
          </div>

          {/* Form area */}
          <div className="px-6 py-6 -mt-4 bg-white rounded-t-3xl relative">
            <p className="text-center text-xs text-gray-400 mb-5">Masuk dengan akun salesman Anda</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span className="flex-1">{error}</span>
                  <button type="button" onClick={clearError} className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-sm font-medium"
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-sm font-medium pr-11"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* IMEI (collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowImei(!showImei)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors mb-1.5"
                >
                  <Smartphone size={12} />
                  Device IMEI {showImei ? '▲' : '▼'}
                </button>
                {showImei && (
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="Device IMEI"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-sm font-mono text-gray-600"
                  />
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Masuk ke Aplikasi
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-blue-300/60 text-xs mt-5">
          &copy; 2026 AHA.id &mdash; Visitation Plan v1.0
        </p>
      </div>
    </div>
  );
}
