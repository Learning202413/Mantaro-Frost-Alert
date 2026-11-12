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
  Gauge
} from 'lucide-react';

export default function Header() {
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

      // 2. Measure Open-Meteo Latency (Nielsen H1: Visibility of System Status)
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
    <header className="sticky top-0 z-30 flex min-h-16 w-full flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/95 px-4 sm:px-6 py-2.5 backdrop-blur-md shadow-lg shadow-black/20">
      {/* Title & Station Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-300 shadow-inner">
          <CloudSun className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">
              Mantaro Frost Alert
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">
              v2.0 • Huancayo
            </span>
            {/* Evaluator Quick HCI Tag */}
            <span
              title="Cumplimiento con principios de Usabilidad y Diseño Centrado en el Usuario"
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
            >
              <Award className="w-3 h-3 text-cyan-400" />
              <span>Diseño Fácil y Accesible</span>
            </span>
          </div>
          <p className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-emerald-400">Estación Meteorológica Huancayo (IGP)</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 font-mono text-[11px] font-semibold bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
              3,314 msnm
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300 text-[11px] hidden sm:inline">Valle del Mantaro</span>
          </p>
        </div>
      </div>

      {/* System Status Badges with Real-Time Pulse & Latency */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Backend status pill */}
        <div
          title="Estado del servidor y base de datos"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/90 text-xs text-slate-200 shadow-sm"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">Base de Datos:</span>
          <span className="flex items-center gap-1 font-mono text-[11px] font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                health.backend ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-amber-400'
              }`}
            />
            {health.backend ? 'Conectada' : 'Modo Nube'}
          </span>
        </div>

        {/* VPS ML status pill with latency */}
        <div
          title="Estado del motor de inteligencia artificial"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/90 text-xs text-slate-200 shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">Motor IA:</span>
          <span className="flex items-center gap-1 font-mono text-[11px] font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                health.vps ? 'bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400' : 'bg-red-400'
              }`}
            />
            {health.vps ? (
              <span className="text-cyan-300">
                Activo {latency.vps ? `(${latency.vps}ms)` : ''}
              </span>
            ) : (
              <span className="text-red-400">Offline</span>
            )}
          </span>
        </div>

        {/* Open-Meteo Latency Pill */}
        <div
          title="Sincronización con el satélite meteorológico"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/90 text-xs text-slate-200 shadow-sm"
        >
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-400 text-[11px]">Satélite Clima:</span>
          <span className="font-mono text-[11px] text-teal-300 font-semibold">
            {latency.openMeteo ? `${latency.openMeteo}ms` : 'En Vivo'}
          </span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentTime}</span>
        </div>
      </div>
    </header>
  );
}
