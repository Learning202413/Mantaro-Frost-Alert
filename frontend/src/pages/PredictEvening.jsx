import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import InputField from '../components/InputField';
import Button from '../components/Button';
import FormMessage from '../components/FormMessage';
import StatusBadge from '../components/StatusBadge';
import { frostPredictionService } from '../services/frostPredictionService';
import {
  weatherService,
  MANTARO_CORRIDOR_ZONES,
  EXCLUDED_ZONES
} from '../services/weatherService';
import { PRESET_SCENARIOS } from '../utils/sampleData';
import {
  Sparkles,
  Thermometer,
  Layers,
  Radio,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  Copy,
  RotateCcw,
  Check,
  Sun,
  CloudRain,
  Moon,
  Sunrise,
  Droplets,
  Wind,
  Compass,
  Calendar,
  Clock,
  Award
} from 'lucide-react';

const INITIAL_FORM = {
  airTemp18: '9.27',
  relativeHumidity18: '49.0',
  pressure18: '688.6',
  windSpeed18: '3.0',
  windDirection18: '303.4',
  minTempToday: '1.2',
  rrAfternoon: '0.0',
  date: '2026-06-25',
  notes: 'Monitoreo de inversión térmica y descenso radiativo nocturno en el fondo del Valle del Mantaro.'
};

export default function PredictEvening() {
  const location = useLocation();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Open-Meteo & Zone Coverage States
  const [selectedZone, setSelectedZone] = useState('chupaca');
  const [syncingWeather, setSyncingWeather] = useState(false);
  const [liveSyncBanner, setLiveSyncBanner] = useState(null);
  const [showExcludedZones, setShowExcludedZones] = useState(false);
  const [selectedExcludedZone, setSelectedExcludedZone] = useState(null);

  useEffect(() => {
    if (location.state?.weather) {
      const w = location.state.weather;
      const z = location.state.zone;
      setFormData((prev) => ({
        ...prev,
        airTemp18: w.TT_18 !== undefined ? String(w.TT_18) : prev.airTemp18,
        relativeHumidity18: w.HR_18 !== undefined ? String(w.HR_18) : prev.relativeHumidity18,
        pressure18: w.PP_18 !== undefined ? String(w.PP_18) : prev.pressure18,
        windSpeed18: w.FF_18 !== undefined ? String(w.FF_18) : prev.windSpeed18,
        windDirection18: w.DD_18 !== undefined ? String(w.DD_18) : prev.windDirection18,
        minTempToday: w.T_min_today !== undefined ? String(w.T_min_today) : prev.minTempToday,
        rrAfternoon: w.RR_afternoon !== undefined ? String(w.RR_afternoon) : '0.0',
        date: w.date || new Date().toISOString().split('T')[0],
        notes: `Punto de monitoreo: ${z?.name || 'Estación'} (${z?.elevation || ''} msnm). Sincronizado desde Mapa Interactivo.`
      }));
      if (z?.id) {
        setSelectedZone(z.id);
      }
      setMessage({
        type: 'success',
        text: `Datos agrometeorológicos sincronizados exitosamente desde el Mapa Interactivo: ${z?.name || 'Estación'}.`
      });
    } else if (location.state?.prefill) {
      setFormData((prev) => ({
        ...prev,
        ...location.state.prefill
      }));
      setMessage({
        type: 'info',
        text: 'Datos cargados automáticamente desde el Explorador de Huancayo.'
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Norman & Shneiderman: Dynamic Dew Point & Depression calculation (Instant Feedback)
  const dewPointAnalysis = useMemo(() => {
    const temp = parseFloat(formData.airTemp18);
    const rh = parseFloat(formData.relativeHumidity18);

    if (isNaN(temp) || isNaN(rh) || rh <= 0 || rh > 100) {
      return null;
    }

    // Magnus-Tetens approximation
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(rh / 100);
    const td = (b * alpha) / (a - alpha);
    const depression = temp - td;

    let condition = 'safe';
    let label = 'Punto de Rocío Seguro';
    let advice = 'Humedad y temperatura lejos del punto de congelación.';
    let badgeClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';

    if (td <= 0 && depression <= 2.5) {
      condition = 'white-frost';
      label = '⚠️ Riesgo Inminente de Helada Blanca (Escarcha)';
      advice =
        'El vapor condensará y se congelará directamente sobre las superficies expuestas. Formación de escarcha superficial por debajo de 0 °C.';
      badgeClass = 'text-amber-300 bg-amber-950/70 border-amber-500/40 animate-pulse';
    } else if (td < 0 && rh < 48) {
      condition = 'black-frost';
      label = '🚨 Riesgo Extremo de Helada Negra (Seca)';
      advice =
        'Aire extremadamente seco sin escarcha visible. Descenso térmico severo con alto gradiente de radiación terrestre.';
      badgeClass = 'text-red-300 bg-red-950/80 border-red-500/50 animate-pulse';
    } else if (td <= 2.0) {
      condition = 'cold-warning';
      label = '❄️ Condición Térmica Muy Fría';
      advice = 'Vigilancia de temperaturas en cotas bajas y hondonadas del valle.';
      badgeClass = 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30';
    }

    return {
      dewPoint: td.toFixed(1),
      depression: depression.toFixed(1),
      condition,
      label,
      advice,
      badgeClass
    };
  }, [formData.airTemp18, formData.relativeHumidity18]);

  // Shneiderman Rule 2: 1-Click Evaluator Preset Shortcuts
  const applyPreset = (preset) => {
    setFormData({
      airTemp18: String(preset.data.airTemp18),
      relativeHumidity18: String(preset.data.relativeHumidity18),
      pressure18: preset.data.pressure18 ? String(preset.data.pressure18) : '',
      windSpeed18: preset.data.windSpeed18 ? String(preset.data.windSpeed18) : '',
      windDirection18: preset.data.windDirection18 ? String(preset.data.windDirection18) : '',
      minTempToday: preset.data.minTempToday ? String(preset.data.minTempToday) : '',
      rrAfternoon: preset.data.rrAfternoon !== undefined ? String(preset.data.rrAfternoon) : '0.0',
      date: preset.data.date || new Date().toISOString().split('T')[0],
      notes: preset.data.notes || ''
    });
    setLiveSyncBanner(null);
    setMessage({
      type: 'info',
      text: `Escenario de prueba cargado: "${preset.shortTitle}"`
    });
  };

  // Nielsen H3: User Control & Freedom (Reset)
  const handleResetForm = () => {
    setFormData({
      airTemp18: '',
      relativeHumidity18: '',
      pressure18: '688.0',
      windSpeed18: '1.5',
      windDirection18: '270.0',
      minTempToday: '3.0',
      rrAfternoon: '0.0',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setResult(null);
    setMessage({
      type: 'info',
      text: 'Formulario restablecido a valores limpios.'
    });
  };

  // Shneiderman Shortcuts & Norman Feedback: Live Weather Sync
  const handleSyncLiveWeather = async () => {
    setSyncingWeather(true);
    setSelectedExcludedZone(null);
    setMessage(null);
    try {
      const liveData = await weatherService.getLiveWeatherForZone(selectedZone);

      setFormData({
        airTemp18: String(liveData.TT_18),
        relativeHumidity18: String(liveData.HR_18),
        pressure18: String(liveData.PP_18),
        windSpeed18: String(liveData.FF_18),
        windDirection18: String(liveData.DD_18),
        minTempToday: String(liveData.T_min_today),
        rrAfternoon: String(liveData.RR_afternoon || 0.0),
        date: liveData.date,
        notes: `Sincronizado vía Open-Meteo para ${liveData.zone.name} (${liveData.elevation} msnm). ${liveData.notation}`
      });

      setLiveSyncBanner({
        zoneName: liveData.zone.name,
        elevation: liveData.elevation,
        data: liveData
      });

      setMessage({
        type: 'success',
        text: `Datos meteorológicos en vivo sincronizados para ${liveData.zone.name}.`
      });
    } catch (err) {
      console.error('[Open-Meteo Error]', err);
      setMessage({
        type: 'error',
        text: `Error al consultar Open-Meteo: ${err.message}`
      });
    } finally {
      setSyncingWeather(false);
    }
  };

  const handleSelectExcludedZone = (exZone) => {
    setSelectedExcludedZone(exZone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validation (Norman Error Prevention)
    if (!formData.airTemp18 || isNaN(Number(formData.airTemp18))) {
      setMessage({ type: 'error', text: 'Ingrese una temperatura válida a las 18:00 h.' });
      return;
    }
    if (!formData.relativeHumidity18 || isNaN(Number(formData.relativeHumidity18))) {
      setMessage({ type: 'error', text: 'Ingrese una humedad relativa válida (0 - 100%).' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        airTemp18: parseFloat(formData.airTemp18),
        relativeHumidity18: parseFloat(formData.relativeHumidity18),
        pressure18: formData.pressure18 ? parseFloat(formData.pressure18) : null,
        windSpeed18: formData.windSpeed18 ? parseFloat(formData.windSpeed18) : null,
        windDirection18: formData.windDirection18 ? parseFloat(formData.windDirection18) : null,
        minTempToday: formData.minTempToday ? parseFloat(formData.minTempToday) : null,
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes
      };

      const res = await frostPredictionService.predictEvening(payload);
      setResult(res);
      setMessage({
        type: 'success',
        text: `¡Pronóstico generado exitosamente! Registrado con ID #${res.id || 'N/A'}.`
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.message || 'Error al comunicarse con el servicio de pronóstico.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Nielsen H3: Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (!result) return;
    const summaryText = `🛡️ FICHA DE MITIGACIÓN TÉRMICA - VALLE DEL MANTARO
📅 Diana: ${result.targetDate || 'Madrugada D+1'} (05:30 h)
🌡️ T. Mínima Pronosticada: ${result.predictedTminC?.toFixed(2)} °C
🚨 Nivel de Alerta: ${result.alertLevel}
🔬 Detalle del Cálculo:
  • Estimación Base (Temperatura): ${result.baseRidgeC?.toFixed(2)} °C
  • Ajuste por Viento y Humedad: ${result.residualRfC?.toFixed(2)} °C
🛡️ Recomendaciones para Proteger tus Cultivos:
  - Riego preventivo por aspersión: Iniciar a las 02:00 AM (el agua al congelarse desprende calor y protege las hojas).
  - Cobertura térmica: Colocar mantas agryl o cubiertas antes del anochecer en zonas bajas.
ℹ️ Sistema Mantaro Frost Alert • Observatorio Huancayo IGP (3,314 msnm)`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <PageContainer
      title="Pronóstico de Heladas (Atardecer 6:00 PM)"
      subtitle="Lectura clave de las 6:00 PM • Calibrado para los campos agrícolas del Valle del Mantaro (3,150 – 3,450 msnm)"
    >
      {/* =========================================================================
          EJEMPLOS Y ATAJOS DE PRUEBA RÁPIDA (1 CLIC)
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ejemplos Rápidos (1 Clic)
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Prueba casos reales al instante
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`p-3 text-left rounded-lg border transition-all cursor-pointer group flex flex-col justify-between ${preset.badgeClass}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900">
                  {preset.shortTitle}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-white/80 border border-current">
                  {preset.targetTemp}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}

          {/* 4th Shortcut: Live Weather Sync */}
          <button
            type="button"
            onClick={handleSyncLiveWeather}
            disabled={syncingWeather}
            className="p-3 text-left rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 text-emerald-600 ${syncingWeather ? 'animate-spin' : 'animate-pulse'}`} />
                📡 Clima en Vivo (Huancayo)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Satélite
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              Descarga el clima actual en el valle directo del satélite meteorológico.
            </p>
          </button>
        </div>
      </div>

      {/* =========================================================================
          NORMAN PHYSICAL CONSTRAINTS: CORRIDOR VALIDATION & EXCLUSION LIMITS
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Zona de Cobertura: Valle del Mantaro
            </h2>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono font-semibold">
            Altitud válida: 3,150 – 3,450 msnm
          </span>
        </div>

        {/* 4 Valid Corridor Zones Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MANTARO_CORRIDOR_ZONES.map((zone) => {
            const isSelected = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  setSelectedZone(zone.id);
                  setSelectedExcludedZone(null);
                }}
                className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {zone.name}
                  </span>
                  {zone.isReference && (
                    <span className="text-[9px] bg-emerald-100 border border-emerald-300 text-emerald-800 px-1 py-0.5 rounded font-mono font-semibold">
                      IGP REF
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-1">
                  {zone.elevation} msnm
                </div>
              </button>
            );
          })}
        </div>

        {/* Collapsible Excluded Zones Accordion */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <button
            type="button"
            onClick={() => setShowExcludedZones((prev) => !prev)}
            className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-xs font-medium text-slate-700">
                ¿Por qué este pronóstico solo aplica al valle y no a la puna o selva?
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[11px]">
                {showExcludedZones ? 'Ocultar' : 'Ver explicación'}
              </span>
              {showExcludedZones ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {showExcludedZones && (
            <div className="p-3 border-t border-slate-200 space-y-2 bg-white">
              <p className="text-xs text-slate-600">
                El modelo fue entrenado con datos de la estación del Observatorio IGP Huancayo (3,314 msnm). En altitudes mayores a 3,700 msnm (puna) o en la selva, el clima, la presión y los vientos son muy diferentes a los del fondo del valle:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {EXCLUDED_ZONES.map((exZone) => (
                  <button
                    key={exZone.id}
                    type="button"
                    onClick={() => handleSelectExcludedZone(exZone)}
                    className="p-2.5 text-left rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100/70 transition-all text-xs text-slate-700 cursor-pointer"
                  >
                    <div className="font-bold text-red-800 flex items-center justify-between">
                      <span>{exZone.name}</span>
                      <span className="text-[10px] font-mono text-red-600">{exZone.altitudeRange}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {exZone.reason}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Live Synchronization Banner */}
      {liveSyncBanner && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/90 shadow-xs space-y-2 relative">
          <button
            type="button"
            onClick={() => setLiveSyncBanner(null)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="text-xs font-bold text-emerald-900">
              Datos meteorológicos en vivo sincronizados para {liveSyncBanner.zoneName} ({liveSyncBanner.elevation} msnm)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
            <div className="bg-white p-2 rounded border border-emerald-200 text-left">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">TT 18:00</span>
              <span className="text-sm font-mono font-bold text-slate-900">{liveSyncBanner.data.TT_18} °C</span>
            </div>
            <div className="bg-white p-2 rounded border border-emerald-200 text-left">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">HR 18:00</span>
              <span className="text-sm font-mono font-bold text-slate-900">{liveSyncBanner.data.HR_18} %</span>
            </div>
            <div className="bg-white p-2 rounded border border-emerald-200 text-left">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">PP 18:00</span>
              <span className="text-sm font-mono font-bold text-slate-900">{liveSyncBanner.data.PP_18} hPa</span>
            </div>
            <div className="bg-white p-2 rounded border border-emerald-200 text-left">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">FF 18:00</span>
              <span className="text-sm font-mono font-bold text-slate-900">{liveSyncBanner.data.FF_18} m/s</span>
            </div>
            <div className="bg-white p-2 rounded border border-emerald-200 text-left">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Tmin Hoy</span>
              <span className="text-sm font-mono font-bold text-slate-900">{liveSyncBanner.data.T_min_today} °C</span>
            </div>
            <div className="bg-white p-2 rounded border border-emerald-200 text-left">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Lluvia Tarde</span>
              <span className="text-sm font-mono font-bold text-slate-900">{liveSyncBanner.data.RR_afternoon || 0} mm</span>
            </div>
          </div>
        </div>
      )}

      {message && (
        <FormMessage
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* =========================================================================
          NORMAN NATURAL MAPPING: CHRONOLOGICAL DIURNAL CYCLE (4 STAGES)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form structured in chronological stages */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ETAPA 1: AMANECER DE HOY (00:00 - 07:00 h) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5 text-indigo-600" />
                    Etapa 1: Amanecer de Hoy (Madrugada Anterior)
                  </h3>
                </div>
                <span className="text-[11px] text-indigo-700 font-medium">
                  Calor acumulado en el suelo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="minTempToday"
                  name="minTempToday"
                  label="Temperatura Más Fría de Hoy (Amanecer)"
                  unit="°C"
                  type="number"
                  step="0.1"
                  min="-20"
                  max="35"
                  value={formData.minTempToday}
                  onChange={handleInputChange}
                  helperText="Termómetro de mínima al amanecer."
                  farmerExplanation="Mide qué tan frío amaneció el suelo hoy. Si ya estuvo cerca de 0°C, la tierra absorbió menos calor y la siguiente helada será más severa."
                />

                <InputField
                  id="date"
                  name="date"
                  label="Fecha de Hoy"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  helperText="Época del año (mes y día)."
                  farmerExplanation="En el valle del Mantaro el mayor riesgo ocurre entre mayo y agosto (temporada seca con cielo despejado y noches heladas)."
                />
              </div>
            </div>

            {/* ETAPA 2: TARDE DE HOY (12:00 - 18:00 h) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    Etapa 2: Tarde de Hoy (12:00 PM a 6:00 PM)
                  </h3>
                </div>
                <span className="text-[11px] text-amber-700 font-medium">
                  Lluvia y humedad de la tarde
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="rrAfternoon"
                  name="rrAfternoon"
                  label="Lluvia de la Tarde (12:00 a 6:00 PM)"
                  unit="mm"
                  type="number"
                  step="0.1"
                  min="0"
                  max="150"
                  value={formData.rrAfternoon}
                  onChange={handleInputChange}
                  helperText="Lluvia caída durante la tarde."
                  farmerExplanation="Si llovió en la tarde, el suelo húmedo retiene calor por evaporación y reduce drásticamente el riesgo de helada por radiación."
                />

                <InputField
                  id="notes"
                  name="notes"
                  label="Lugar o Parcela Monitoreada"
                  type="text"
                  placeholder="Ej. Estación Huancayo - Chupaca (3,314 msnm)"
                  value={formData.notes}
                  onChange={handleInputChange}
                  helperText="Identificador del punto de observación."
                  farmerExplanation="Indique la ubicación o altitud para adaptar las recomendaciones de protección térmica."
                />
              </div>
            </div>

            {/* ETAPA 3: CORTE VESPERTINO CLAVE (18:00 h) */}
            <div className="bg-white border-2 border-emerald-300 rounded-xl p-4 shadow-xs text-left space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    Etapa 3: Mediciones de las 6:00 PM (Al Atardecer)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Lectura Principal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="airTemp18"
                  name="airTemp18"
                  label="Temperatura del Aire a las 6:00 PM"
                  unit="°C"
                  type="number"
                  step="0.01"
                  min="-20"
                  max="40"
                  required
                  value={formData.airTemp18}
                  onChange={handleInputChange}
                  helperText="Temperatura al caer la tarde."
                  farmerExplanation="Si a las 6 de la tarde la temperatura ya está por debajo de 10°C, el enfriamiento nocturno alcanzará el punto de congelación antes del amanecer."
                />

                <InputField
                  id="relativeHumidity18"
                  name="relativeHumidity18"
                  label="Humedad del Aire a las 6:00 PM"
                  unit="%"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formData.relativeHumidity18}
                  onChange={handleInputChange}
                  helperText="Humedad en el ambiente."
                  farmerExplanation="El vapor de agua actúa como un invernadero natural. Si la humedad es menor a 50%, no hay vapor que retenga el calor y el suelo se enfría a gran velocidad."
                />

                <InputField
                  id="pressure18"
                  name="pressure18"
                  label="Presión del Aire a las 6:00 PM"
                  unit="hPa"
                  type="number"
                  step="0.1"
                  min="500"
                  max="1100"
                  value={formData.pressure18}
                  onChange={handleInputChange}
                  helperText="En Huancayo (3,314 msnm) ronda ~688 hPa."
                  farmerExplanation="La presión alta andina suele asociarse a cielos completamente despejados y aire seco que facilitan la helada."
                />

                <InputField
                  id="windSpeed18"
                  name="windSpeed18"
                  label="Velocidad del Viento a las 6:00 PM"
                  unit="m/s"
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  value={formData.windSpeed18}
                  onChange={handleInputChange}
                  helperText="Viento en calma (<1.5 m/s) favorece la helada."
                  farmerExplanation="Si no hay viento, el aire helado más pesado se asienta en el fondo de las chacras (inversión térmica) y congela las plantas."
                />

                <InputField
                  id="windDirection18"
                  name="windDirection18"
                  label="Dirección del Viento a las 6:00 PM"
                  unit="° azimut"
                  type="number"
                  step="0.1"
                  min="0"
                  max="360"
                  value={formData.windDirection18}
                  onChange={handleInputChange}
                  helperText="270° = Oeste, 315° = Noroeste."
                  farmerExplanation="En el valle, los vientos del oeste y noroeste bajan de las cordilleras secas e intensifican el enfriamiento nocturno."
                />
              </div>

              {/* REAL-TIME FEEDBACK: LIVE DEW POINT */}
              {dewPointAnalysis && (
                <div className={`p-3 rounded-lg border text-left space-y-1.5 transition-all bg-emerald-50 border-emerald-200 text-emerald-950`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-900">
                      <Droplets className="w-3.5 h-3.5 text-emerald-700" />
                      {dewPointAnalysis.label}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-xs font-semibold text-emerald-900">
                      <span>Punto Rocío: <strong>{dewPointAnalysis.dewPoint} °C</strong></span>
                      <span>Sequedad: <strong>{dewPointAnalysis.depression} °C</strong></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    {dewPointAnalysis.advice}
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Execute & Reset */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={RotateCcw}
                onClick={handleResetForm}
                className="w-full sm:w-auto text-slate-700 border-slate-300 bg-white hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                Restablecer formulario
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={Sparkles}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs px-6 py-2.5 rounded-xl cursor-pointer"
              >
                {loading ? 'Calculando Pronóstico...' : 'Ejecutar Pronóstico de Helada'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Stage 4 - Ficha de Recomendaciones Agrícolas */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 shadow-xs space-y-5 text-left">
              {/* Header result */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Recomendaciones para Proteger tus Cultivos
                  </span>
                </div>
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Madrugada de Mañana (5:30 AM)
                </span>
              </div>

              {/* Giant Thermal Gauge */}
              <div className="text-center py-5 px-4 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden">
                <div className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
                  Temperatura Mínima Esperada al Amanecer
                </div>

                {/* Big Temperature Display */}
                <div
                  className={`text-6xl font-black font-mono my-2 tracking-tight ${
                    result.predictedTminC <= 1.0
                      ? 'text-red-600'
                      : result.predictedTminC <= 2.0
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {result.predictedTminC.toFixed(2)} °C
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <StatusBadge level={result.alertLevel} size="lg" />
                </div>

                {/* Plain-Spanish Diagnosis for Valley Farmers */}
                <p className="text-xs text-slate-700 mt-3 max-w-sm mx-auto leading-relaxed font-medium">
                  {result.predictedTminC <= 0
                    ? '⚠️ HELADA FUERTE: Congelará el agua y quemará las hojas en los campos. Se deben tomar medidas inmediatas.'
                    : result.predictedTminC <= 2.0
                    ? '❄️ RIESGO DE ESCARCHA: Habrá frío intenso en las partes bajas del valle con peligro de escarcha matutina.'
                    : '✅ SIN PELIGRO DE HELADA: La noche será templada y los cultivos están a salvo.'}
                </p>
              </div>

              {/* Simple Model Explanation */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>¿Cómo se calculó la temperatura?</span>
                  <span className="text-emerald-700 font-medium">Modelo Inteligente</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Pronóstico Base
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {result.baseRidgeC.toFixed(2)} °C
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Enfriamiento natural del cielo
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Ajuste por Viento y Humedad
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                      {result.residualRfC >= 0 ? `+${result.residualRfC.toFixed(2)}` : result.residualRfC.toFixed(2)} °C
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Condición local del valle
                    </div>
                  </div>
                </div>
              </div>

              {/* Thermal Mitigation Actions for Mantaro Corridor */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  <span>Qué Hacer Para Cuidar la Chacra</span>
                </div>

                <div className="space-y-2 text-xs text-slate-800">
                  <div className="p-2.5 rounded bg-white border border-emerald-200">
                    <span className="font-bold text-amber-800 block">
                      🌊 Riego preventivo por aspersión (2:00 AM):
                    </span>
                    {result.predictedTminC <= 1.0 ? (
                      <p className="mt-0.5 text-slate-700 leading-relaxed">
                        Prender el <strong>riego por aspersión a las 2:00 AM</strong>. Al congelarse el agua en la superficie libera calor natural y evita que la hoja se congele por dentro.
                      </p>
                    ) : (
                      <p className="mt-0.5 text-slate-700 leading-relaxed">
                        Mantener la tierra húmeda para que guarde calor. Vigilar parcelas en partes bajas de Chupaca y Sicaya.
                      </p>
                    )}
                  </div>

                  <div className="p-2.5 rounded bg-white border border-emerald-200">
                    <span className="font-bold text-amber-800 block">
                      🛡️ Mantas y cubiertas para el cultivo:
                    </span>
                    <p className="mt-0.5 text-slate-700 leading-relaxed">
                      {result.predictedTminC <= 1.5
                        ? 'Tapar los cultivos sensibles con mantas térmicas agryl antes de las 7:00 PM para evitar que el calor se escape hacia el cielo.'
                        : 'Condiciones normales. No es necesario colocar mantas térmicas.'}
                    </p>
                  </div>
                </div>

                {/* Cronograma Nocturno */}
                <div className="pt-2 border-t border-emerald-200 text-[11px] text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block">⏰ Horarios Clave para Esta Noche:</span>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">10:00 PM</span>
                      <span className="text-slate-800 font-semibold">Revisar cielo</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-amber-700 block text-[10px]">02:00 AM</span>
                      <span className="text-amber-800 font-bold">Activar Riego</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-red-700 block text-[10px]">05:30 AM</span>
                      <span className="text-red-800 font-bold">Pico Más Frío</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy Summary to WhatsApp */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopySummary}
                  className={`w-full ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-900 text-white cursor-pointer'
                  }`}
                >
                  {copied ? '¡Recomendaciones Copiadas!' : 'Copiar Resumen para WhatsApp o SMS'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3 shadow-xs">
              <Layers className="w-14 h-14 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-800">
                Esperando Ejecución del Pronóstico
              </h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Seleccione uno de los <strong>ejemplos rápidos</strong> arriba o ingrese las lecturas de las 6:00 PM y haga clic en "Ejecutar Pronóstico de Helada".
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium pt-2">
                <span>Obs. Huancayo IGP • 3,314 msnm</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
