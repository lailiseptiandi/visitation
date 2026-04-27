import { Outlet, NavLink } from 'react-router-dom';
import { LayoutList, ClipboardCheck, UserCircle2 } from 'lucide-react';

const navItems = [
  { href: '/mobile', icon: LayoutList, label: 'Rute Hari Ini', end: true },
  { href: '/mobile/attendance', icon: ClipboardCheck, label: 'Absensi', end: false },
  { href: '/mobile/profile', icon: UserCircle2, label: 'Profil', end: false },
];

export default function MobileLayout() {
  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Phone frame */}
      <div className="relative w-full max-w-[430px] min-h-screen bg-gray-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Status bar */}
        <div className="bg-primary flex items-center justify-between px-5 pt-3 pb-1.5">
          <span className="text-white text-xs font-semibold">
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs">●●●●</span>
            <span className="text-white text-xs">WiFi</span>
            <span className="text-white text-xs">🔋</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-[72px] scroll-smooth">
          <Outlet />
        </div>

        {/* Bottom navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
          <div className="flex h-[72px] items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                    isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                      <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
                    </div>
                    <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : ''}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
