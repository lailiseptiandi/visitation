import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  MapPin,
  Phone,
  Shield,
  ChevronRight,
  ClipboardList,
  Bell,
  HelpCircle,
  Settings,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const name = user?.name || user?.full_name || user?.username || 'Sales';
  const username = user?.username || '-';
  const role = user?.role || 'Salesman';
  const area = user?.area || user?.group_salesman_name || '-';
  const phone = user?.phone_number || user?.phone || '-';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuSections = [
    {
      title: 'Akun',
      items: [
        { icon: User, label: 'Informasi Profil', sub: username },
        { icon: Phone, label: 'Nomor HP', sub: phone },
        { icon: MapPin, label: 'Area Tugas', sub: area },
        { icon: Shield, label: 'Peran', sub: role },
      ],
    },
    {
      title: 'Aplikasi',
      items: [
        { icon: Bell, label: 'Notifikasi', sub: 'Aktif' },
        { icon: ClipboardList, label: 'Riwayat Kunjungan' },
        { icon: Settings, label: 'Pengaturan' },
        { icon: HelpCircle, label: 'Bantuan & FAQ' },
      ],
    },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header gradient */}
      <div className="bg-gradient-to-b from-primary to-blue-600 px-5 pt-4 pb-16">
        <h1 className="text-white text-lg font-bold">Profil Saya</h1>
      </div>

      {/* Avatar card — overlaps the header */}
      <div className="px-4 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white text-xl font-bold">{initials || 'S'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 truncate">{name}</p>
            <p className="text-sm text-gray-500 truncate">@{username}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 bg-blue-50 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                <Shield size={10} />
                {role}
              </span>
              {area !== '-' && (
                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  <MapPin size={10} />
                  {area}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-4 mt-4 space-y-4 pb-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    {item.sub && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 bg-red-50 text-red-600 font-semibold py-4 rounded-2xl hover:bg-red-100 active:bg-red-200 transition-colors"
        >
          <LogOut size={18} />
          Keluar dari Aplikasi
        </button>

        <p className="text-center text-xs text-gray-300 pb-2">
          Visitation Plan v1.0.0 · AHA.id
        </p>
      </div>
    </div>
  );
}
