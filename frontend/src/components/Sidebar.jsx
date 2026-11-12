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
    label: 'Cómo Funciona el Sistema',
    icon: Cpu
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between h-screen sticky top-0 shadow-xl">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-950/60">
            <ThermometerSnowflake className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white tracking-wide">
              MANTARO FROST
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              Alertas para el Agricultor
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 text-left">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
                      ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Course Context */}
      <div className="p-4 border-t border-slate-800/80 text-left bg-slate-900/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>Construcción de Software</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Hackaton v02 • Valle del Mantaro (Junín)
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-emerald-400/90 font-medium">Huancayo - Junín</span>
          <span>Perú</span>
        </div>
      </div>
    </aside>
  );
}
