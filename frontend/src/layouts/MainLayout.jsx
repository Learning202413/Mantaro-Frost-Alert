import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  MapPin,
  Sparkles,
  History,
  BarChart3,
  Cpu
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { path: '/', label: 'Mapa', icon: MapPin },
  { path: '/predict', label: 'Pronóstico', icon: Sparkles },
  { path: '/history', label: 'Historial', icon: History },
  { path: '/explorer', label: 'Datos EMA', icon: BarChart3 },
  { path: '/model', label: 'Modelo ML', icon: Cpu }
];

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar for Desktop & Slide-over Drawer for Mobile */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-20 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (thumb-friendly for field use) */}
        <nav
          aria-label="Navegación móvil inferior"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg flex items-center justify-around"
        >
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[56px] ${
                    isActive
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1 rounded-lg transition-colors ${
                        isActive ? 'bg-emerald-100/80 text-emerald-800' : 'text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] tracking-tight mt-0.5">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
