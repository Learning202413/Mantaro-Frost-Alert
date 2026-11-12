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
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4.5 transition-all hover:border-slate-300 hover:shadow-md shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${currentTheme}`}>
            <Icon className="w-4 h-4 text-current" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-500 font-mono">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600">
          {trend && <span className="font-bold text-slate-900">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
