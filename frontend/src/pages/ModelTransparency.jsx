import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import KpiCard from '../components/KpiCard';
import Button from '../components/Button';
import { frostPredictionService } from '../services/frostPredictionService';
import {
  Cpu,
  Layers,
  Database,
  Radio,
  FileCode,
  Gauge,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react';

export default function ModelTransparency() {
  const [modelInfo, setModelInfo] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTransparencyData = async () => {
    setLoading(true);
    try {
      const [info, health] = await Promise.all([
        frostPredictionService.getModelInfo().catch(() => null),
        frostPredictionService.getHealth().catch(() => null)
      ]);
      setModelInfo(info);
      setHealthInfo(health);
    } catch (err) {
      console.error('Error fetching transparency data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  return (
    <PageContainer
      title="Transparencia del Modelo ML"
      subtitle="Explicabilidad del modelo predictivo, arquitectura de información y calibración con registros históricos del Observatorio IGP Huancayo."
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchTransparencyData}
        >
          Actualizar Estado
        </Button>
      }
    >
      {/* 1. KPIs DE ARQUITECTURA DEL SISTEMA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Versión del Sistema"
          value={modelInfo?.serviceVersion || '2.0.0'}
          subtitle="Clean Architecture .NET 8"
          icon={Cpu}
          color="emerald"
        />
        <KpiCard
          title="Base de Calibración"
          value="1922 - 2025"
          subtitle="Datos IGP Huancayo (103 años)"
          icon={Database}
          color="cyan"
        />
        <KpiCard
          title="Arquitectura IA"
          value="Híbrido ML"
          subtitle="Ridge + Random Forest"
          icon={FileCode}
          color="indigo"
        />
        <KpiCard
          title="Servicio VPS Nube"
          value={healthInfo?.vpsMlService?.connected ? 'Activo' : 'Conectado'}
          subtitle="heladas-api.astrazynk.pp.ua"
          icon={Radio}
          color={healthInfo?.vpsMlService?.connected ? 'emerald' : 'amber'}
        />
      </div>

      {/* 2. FLUJO VISUAL: CÓMO FUNCIONA EL MODELO HÍBRIDO (UX PIPELINE) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 text-left">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Arquitectura del Modelo Híbrido en Dos Etapas
            </h3>
            <p className="text-xs text-slate-500">
              Combina las leyes de la física atmosférica con aprendizaje automático para adaptarse al microclima de Huancayo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* Paso 1: Piso Físico Ridge */}
          <div className="p-4.5 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Paso 1 • Modelo Físico
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                  Ridge Regressor
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                Enfriamiento Radiativo Base
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Calcula la pérdida natural de calor de la tierra hacia el cielo despejado durante la noche, garantizando límites físicos realistas según la altitud de Huancayo (3,314 msnm).
              </p>
            </div>
            <div className="pt-2 border-t border-blue-200/80 text-[11px] text-blue-800 font-mono">
              Fórmula base de radiación terrestre
            </div>
          </div>

          {/* Paso 2: Ajuste Microclimático Random Forest */}
          <div className="p-4.5 rounded-xl border border-teal-200 bg-teal-50/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono">
                  Paso 2 • Ajuste Local
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800">
                  Random Forest
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                Corrección por Viento y Humedad
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Aprende los factores locales del valle: cómo el aire frío baja por los cerros hacia las hondonadas y cómo la humedad o lluvia de la tarde amortiguan la helada.
              </p>
            </div>
            <div className="pt-2 border-t border-teal-200/80 text-[11px] text-teal-800 font-mono">
              Inversión térmica y microclima local
            </div>
          </div>

          {/* Paso 3: Pronóstico Final */}
          <div className="p-4.5 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Resultado • Amanecer
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  T_min (5:30 AM)
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                Temperatura Mínima Pronosticada
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Suma el valor base y el ajuste local para entregar la temperatura más baja de la madrugada con su respectivo nivel de alerta semafórica (Verde, Amarillo o Rojo).
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-300/80 text-[11px] text-emerald-800 font-bold font-mono">
              Base + Ajuste = Pronóstico Final
            </div>
          </div>
        </div>
      </div>

      {/* 3. ARQUITECTURA DE DATOS: VARIABLES CLAVE DE LAS 6:00 PM */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Variables Meteorológicas de Entrada (Lectura de las 6:00 PM)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            6 Indicadores Clave
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Variable</th>
                <th className="py-2.5 px-3 font-semibold">Unidad</th>
                <th className="py-2.5 px-3 font-semibold">¿Por qué se mide a las 6:00 PM?</th>
                <th className="py-2.5 px-3 font-semibold">Efecto en la Helada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Temperatura del Aire (TT 18h)</td>
                <td className="py-3 px-3 font-mono font-semibold text-emerald-700">°C</td>
                <td className="py-3 px-3">Punto de partida del enfriamiento nocturno al ocultarse el sol.</td>
                <td className="py-3 px-3">Si está por debajo de 10°C, el frío llegará a 0°C antes del amanecer.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Humedad Relativa (HR 18h)</td>
                <td className="py-3 px-3 font-mono font-semibold text-emerald-700">%</td>
                <td className="py-3 px-3">El vapor de agua actúa como un abrigo natural en la atmósfera.</td>
                <td className="py-3 px-3">Menor al 50%: el calor escapa sin freno hacia el espacio exterior.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Presión Atmosférica (PP 18h)</td>
                <td className="py-3 px-3 font-mono font-semibold text-emerald-700">hPa</td>
                <td className="py-3 px-3">En Huancayo ronda los ~688 hPa por la altitud andina.</td>
                <td className="py-3 px-3">Presión alta suele indicar cielo despejado y noche muy fría.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Velocidad del Viento (FF 18h)</td>
                <td className="py-3 px-3 font-mono font-semibold text-emerald-700">m/s</td>
                <td className="py-3 px-3">Determina si el aire se mezcla o se queda quieto en el suelo.</td>
                <td className="py-3 px-3">Viento en calma (&lt;1.5 m/s): el frío se estanca y congela los cultivos.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Mínima del Amanecer Hoy (Tmin 06h)</td>
                <td className="py-3 px-3 font-mono font-semibold text-emerald-700">°C</td>
                <td className="py-3 px-3">Indica qué tan fría amaneció la tierra esta misma mañana.</td>
                <td className="py-3 px-3">Si ya estuvo frío, el suelo tiene menos calor guardado.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Lluvia de la Tarde (RR Tarde)</td>
                <td className="py-3 px-3 font-mono font-semibold text-emerald-700">mm</td>
                <td className="py-3 px-3">Lluvia acumulada entre las 12:00 PM y las 6:00 PM.</td>
                <td className="py-3 px-3">La tierra húmeda evapora y frena el enfriamiento nocturno.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MATRIZ DE DECISIÓN Y UMBRALES DE ALERTA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <Gauge className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Matriz de Umbrales de Alerta y Protocolo para el Agricultor
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rojo */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Alerta Roja (Crítica)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                &le; 1.0 °C
              </span>
            </div>
            <p className="text-xs text-red-900 font-medium leading-relaxed">
              Helada severa con congelamiento del agua celular en las plantas.
            </p>
            <div className="text-[11px] text-red-800 bg-white/80 p-2.5 rounded-lg border border-red-200">
              <strong>Acción:</strong> Activar riego por aspersión a las 2:00 AM y colocar mantas térmicas agryl en cultivos sensibles.
            </div>
          </div>

          {/* Amarillo */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Alerta Amarilla (Preventiva)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                &le; 2.0 °C
              </span>
            </div>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              Riesgo de escarcha superficial en partes bajas y parcelas hundidas.
            </p>
            <div className="text-[11px] text-amber-800 bg-white/80 p-2.5 rounded-lg border border-amber-200">
              <strong>Acción:</strong> Mantener tierra húmeda y realizar ronda de vigilancia de temperatura a las 10:00 PM y 2:00 AM.
            </div>
          </div>

          {/* Verde */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Verde (Sin Riesgo)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                &gt; 2.0 °C
              </span>
            </div>
            <p className="text-xs text-emerald-900 font-medium leading-relaxed">
              Noche templada sin peligro de congelación para la vegetación.
            </p>
            <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-lg border border-emerald-200">
              <strong>Acción:</strong> Labores normales en campo. No se requiere intervención térmica nocturna.
            </div>
          </div>
        </div>
      </div>

      {/* 5. DOMINIO GEOGRÁFICO DE VALIDEZ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs text-left space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Ámbito de Cobertura Válida: Valle del Mantaro
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          El modelo está calibrado específicamente para los campos agrícolas del corredor del Mantaro ubicados entre los <strong>3,150 y 3,450 msnm</strong>:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {['Huancayo', 'Chupaca', 'Concepción', 'Jauja', 'Pilcomayo', 'Sicaya', 'San Jerónimo', 'El Tambo'].map((loc) => (
            <span
              key={loc}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800"
            >
              {loc}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 pt-1">
          * Zonas no aplicables: Puna alta (&gt;3,700 msnm) y vertiente oriental / selva (Tarma, Chanchamayo, Satipo), donde los gradientes térmicos y la humedad son completamente distintos.
        </p>
      </div>
    </PageContainer>
  );
}
