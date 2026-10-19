import React from 'react';
import {
  LayoutGrid,
  Users,
  UserPlus,
  Sparkles,
  Crown,
  Receipt,
  BarChart3,
  Bell,
  Settings
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { activeMenu, setActiveMenu, unreadNotificationsCount } = useSaloon();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'employees', label: 'Employees', icon: UserPlus },
    { id: 'services-products', label: 'Services & Products', icon: Sparkles },
    { id: 'memberships', label: 'Memberships', icon: Crown },
    { id: 'billing', label: 'Billing & POS', icon: Receipt, highlight: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, badgeCount: unreadNotificationsCount },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSelect = (id) => {
    setActiveMenu(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0A0C0F] border-r border-[#1D2028] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out overflow-y-auto overflow-x-hidden lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #101216 0%, #080A0D 100%)',
          boxShadow: '6px 0 30px rgba(0, 0, 0, 0.45)'
        }}
      >
        <div>
          {/* Top Brand Header - Pure Vector & Typography matching exact reference */}
          <div className="pt-7 pb-4 px-4 flex flex-col items-center justify-center text-center">
            {/* Royal Gold Crossed Shears Emblem */}
            <div className="relative mb-2.5 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#D4AF37]/25 blur-md rounded-full pointer-events-none" />
              <svg
                width="46"
                height="46"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
              >
                <defs>
                  <linearGradient id="logoGoldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF3B0" />
                    <stop offset="35%" stopColor="#E5C365" />
                    <stop offset="70%" stopColor="#C59B27" />
                    <stop offset="100%" stopColor="#9E7814" />
                  </linearGradient>
                </defs>
                {/* Crossed Shears blades & handles */}
                <circle cx="15" cy="14" r="5" stroke="url(#logoGoldSheen)" strokeWidth="2.4" fill="none" />
                <circle cx="33" cy="14" r="5" stroke="url(#logoGoldSheen)" strokeWidth="2.4" fill="none" />
                <path d="M18.5 17.5 L34 38" stroke="url(#logoGoldSheen)" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M29.5 17.5 L14 38" stroke="url(#logoGoldSheen)" strokeWidth="2.6" strokeLinecap="round" />
                {/* Center pivot screw */}
                <circle cx="24" cy="27" r="2.6" fill="url(#logoGoldSheen)" />
                <circle cx="24" cy="27" r="1.1" fill="#121418" />
              </svg>
            </div>

            {/* PHOENIX SALOON text */}
            <h1
              className="text-[18px] font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#FFF3B0] via-[#E5C365] to-[#C59B27] uppercase drop-shadow-sm select-none"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              PHOENIX SALOON
            </h1>

            {/* LUXURY SALON & SPA text */}
            <p
              className="text-[9px] font-semibold tracking-[0.3em] text-[#D8A843] uppercase mt-1 select-none opacity-90"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              LUXURY SALON &amp; SPA
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="px-3.5 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5D480] via-[#DDAF4E] to-[#C79633] text-[#121418] font-bold shadow-[0_4px_18px_rgba(216,168,67,0.35)]'
                      : 'text-[#E1E4EA] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      size={20}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#121418]'
                          : 'text-[#D8A843] group-hover:text-[#F3D079]'
                      }`}
                    />
                    <span className="tracking-wide text-[13.5px]">{item.label}</span>
                  </div>

                  {item.badgeCount > 0 && !isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EF4444] text-white shadow-xs animate-pulse">
                      {item.badgeCount}
                    </span>
                  )}

                  {item.highlight && !isActive && !item.badgeCount && (
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#E5C158] text-[#121418] shadow-sm">
                      POS
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section with luxury salon tools image & "BEAUTY BEYOND EVERYDAY" slogan */}
        <div className="mt-auto pt-3 relative w-full overflow-hidden flex flex-col items-center">
          <div className="w-full relative">
            {/* Top gradient fade for seamless transition */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#101216] via-[#101216]/60 to-transparent z-10 pointer-events-none" />
            
            {/* Bottom gradient fade into slogan */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#080A0D] via-[#080A0D]/70 to-transparent z-10 pointer-events-none" />

            <img
              src="/images/sidebar_bottom.jpg"
              alt="Luxury Salon Tools"
              className="w-full h-auto object-cover select-none pointer-events-none"
            />
          </div>

          {/* Slogan */}
          <div className="w-full px-4 pb-6 pt-2 text-center bg-[#080A0D]">
            <p
              className="text-[14px] font-bold tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-[#F5D480] via-[#E5C365] to-[#C79633] uppercase leading-relaxed select-none drop-shadow-sm"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              BEAUTY<br />
              BEYOND<br />
              EVERYDAY
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
