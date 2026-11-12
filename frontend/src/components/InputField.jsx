import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function InputField({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  step,
  min,
  max,
  unit,
  helperText,
  farmerExplanation,
  error,
  disabled = false,
  className = ''
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  // Norman Physical Constraints: Instant validation
  const numValue = type === 'number' && value !== '' && value !== null && value !== undefined
    ? parseFloat(value)
    : null;

  const isOutOfRange =
    numValue !== null &&
    !isNaN(numValue) &&
    ((min !== undefined && numValue < min) || (max !== undefined && numValue > max));

  return (
    <div className={`flex flex-col gap-1.5 text-left ${className}`}>
      {/* Label & Signifiers */}
      {label && (
        <div className="flex items-center justify-between gap-1 text-xs">
          <label
            htmlFor={id || name}
            className="font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{label}</span>
            {required && (
              <span className="text-emerald-600 font-bold" title="Campo obligatorio">
                *
              </span>
            )}
          </label>

          <div className="flex items-center gap-1.5">
            {farmerExplanation && (
              <button
                type="button"
                onClick={() => setShowExplanation((prev) => !prev)}
                className="text-slate-400 hover:text-emerald-600 p-0.5 rounded transition-colors focus:outline-none"
                title="Ver explicación en lenguaje del agricultor"
                aria-label="Ayuda para agricultores"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600/80 hover:text-emerald-700" />
              </button>
            )}

            {unit && (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                {unit}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input container with Norman Affordances */}
      <div className="relative rounded-lg shadow-xs">
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className={`w-full rounded-lg bg-white border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono transition-all duration-150 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
              : isOutOfRange
              ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20 bg-amber-50/50 text-amber-900'
              : 'border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-emerald-500/20'
          } ${unit ? 'pr-14' : ''}`}
        />

        {/* Distinct Unit Badge (Affordance) */}
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-semibold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {unit}
            </span>
          </div>
        )}
      </div>

      {/* Norman Explanation Banner for Farmers */}
      {showExplanation && farmerExplanation && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed animate-in fade-in-50">
          <span className="font-bold text-emerald-800 block mb-0.5">🌾 Significado para el cultivo:</span>
          {farmerExplanation}
        </div>
      )}

      {/* Physical Constraint Warning (Norman Heuristic) */}
      {isOutOfRange && !error && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Fuera de rango físico admisible ({min} a {max} {unit || ''}). Verifique el dato.
          </span>
        </div>
      )}

      {/* Standard Helper Text */}
      {helperText && !error && !isOutOfRange && (
        <p className="text-[11px] text-slate-400 leading-snug">{helperText}</p>
      )}

      {/* Strict Error message */}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
