import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  History,
  BarChart3,
  Cpu,
  ThermometerSnowflake,
  GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Mapa Interactivo del Valle',
    icon: MapPin,
    badge: 'En Vivo'
  },
  {
    path: '/predict',
    label: 'Pronóstico del Atardecer (6:00 PM)',
    icon: Sparkles
  },
  {
    path: '/history',
    label: 'Historial de Alertas Registradas',
    icon: History
  },
  {
    path: '/explorer',
    label: 'Explorador de Datos EMA - IGP Huancayo',
    icon: BarChart3
  },
  {
    path: '/model',
    label: 'Transparencia del Modelo ML',
    icon: Cpu
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between h-screen sticky top-0 shadow-xs">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xs">
            <ThermometerSnowflake className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-900 tracking-wide">
              MANTARO FROST
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold">
              Alertas para el Agricultor
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 text-left">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menú Principal
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Course Context */}
      <div className="p-4 border-t border-slate-200 text-left bg-slate-50/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>Construcción de Software</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Hackaton v02 • Valle del Mantaro (Junín)
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="text-emerald-700 font-semibold">Huancayo - Junín</span>
          <span>Perú</span>
        </div>
      </div>
    </aside>
  );
}
