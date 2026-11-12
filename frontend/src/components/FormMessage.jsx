import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function FormMessage({
  type = 'info', // 'success' | 'error' | 'info'
  message,
  onClose,
  className = ''
}) {
  if (!message) return null;

  const configs = {
    success: {
      bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600'
    },
    error: {
      bgClass: 'bg-red-50 border-red-200 text-red-900',
      icon: AlertCircle,
      iconClass: 'text-red-600'
    },
    info: {
      bgClass: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      icon: Info,
      iconClass: 'text-cyan-600'
    }
  };

  const config = configs[type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border text-sm ${config.bgClass} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />
        <div className="leading-snug">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
