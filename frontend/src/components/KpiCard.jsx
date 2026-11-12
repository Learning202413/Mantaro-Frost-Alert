import React from 'react';

export default function KpiCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
  className = ''
}) {
  const colorMap = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-700'
  };

  const currentTheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 sm:p-4.5 transition-all hover:border-slate-300 hover:shadow-md shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 sm:p-2 rounded-lg border ${currentTheme} shrink-0`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-current" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1 sm:gap-1.5">
        <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-mono truncate">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-slate-500 font-mono">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 leading-tight">
          {trend && <span className="font-bold text-slate-900 shrink-0">{trend}</span>}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
