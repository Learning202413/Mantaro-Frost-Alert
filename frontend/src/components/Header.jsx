import React, { useState, useEffect } from 'react';
import { frostPredictionService } from '../services/frostPredictionService';
import {
  Radio,
  Database,
  CloudSun,
  Clock,
  Sparkles,
  Award,
  Activity,
  Gauge,
  Menu
} from 'lucide-react';

export default function Header({ onOpenMobileMenu = () => {} }) {
  const [health, setHealth] = useState({ backend: false, vps: false });
  const [latency, setLatency] = useState({ vps: null, openMeteo: null });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-PE'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-PE'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      // 1. Check VPS / Backend Health & Latency
      const startVps = performance.now();
      try {
        const res = await frostPredictionService.getHealth();
        const vpsMs = Math.round(performance.now() - startVps);
        setHealth({
          backend: Boolean(res?.database?.connected),
          vps: Boolean(res?.vpsMlService?.connected || res?.status === 'online' || res?.status === 'ok')
        });
        setLatency((prev) => ({ ...prev, vps: vpsMs }));
      } catch {
        setHealth({ backend: false, vps: false });
        setLatency((prev) => ({ ...prev, vps: null }));
      }

      // 2. Measure Open-Meteo Latency
      const startMeteo = performance.now();
      try {
        const testRes = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-12.04&longitude=-75.32&current_weather=true',
          { signal: AbortSignal.timeout(3500) }
        );
        if (testRes.ok) {
          const meteoMs = Math.round(performance.now() - startMeteo);
          setLatency((prev) => ({ ...prev, openMeteo: meteoMs }));
        }
      } catch {
        setLatency((prev) => ({ ...prev, openMeteo: null }));
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-14 sm:min-h-16 w-full items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-200/90 bg-white/95 px-3 sm:px-6 py-2 backdrop-blur-md shadow-xs">
      {/* Title, Station Info & Mobile Menu Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger trigger for mobile */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer shrink-0"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/15 to-cyan-500/15 border border-emerald-500/30 text-emerald-700 shadow-xs shrink-0">
          <CloudSun className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="text-left truncate">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
              Mantaro Frost Alert
            </h1>
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono shrink-0">
              v2.0
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600 flex items-center gap-1.5 truncate">
            <span className="font-semibold text-emerald-700 truncate">Huancayo (IGP)</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-800 font-mono text-[9px] sm:text-[11px] font-semibold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 shrink-0">
              3,314 msnm
            </span>
          </p>
        </div>
      </div>

      {/* System Status Badges with Real-Time Pulse & Latency */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Backend status pill */}
        <div
          title="Estado del servidor y base de datos"
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-200 bg-slate-50 text-[10px] sm:text-xs text-slate-700 shadow-xs"
        >
          <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
          <span className="text-slate-500 hidden sm:inline">BD:</span>
          <span className="flex items-center gap-1 font-mono font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                health.backend ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden xs:inline">{health.backend ? 'Online' : 'Nube'}</span>
          </span>
        </div>

        {/* VPS ML status pill with latency */}
        <div
          title="Estado del motor de inteligencia artificial"
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-200 bg-slate-50 text-[10px] sm:text-xs text-slate-700 shadow-xs"
        >
          <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-600 shrink-0" />
          <span className="text-slate-500 hidden sm:inline">IA:</span>
          <span className="flex items-center gap-1 font-mono font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                health.vps ? 'bg-cyan-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {health.vps ? (
              <span className="text-cyan-800 font-bold">
                OK {latency.vps ? <span className="hidden md:inline">({latency.vps}ms)</span> : ''}
              </span>
            ) : (
              <span className="text-red-600 font-bold">Offline</span>
            )}
          </span>
        </div>

        {/* Real-time Clock (hidden on tiny screens to avoid wrapping) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 font-mono px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentTime}</span>
        </div>
      </div>
    </header>
  );
}
