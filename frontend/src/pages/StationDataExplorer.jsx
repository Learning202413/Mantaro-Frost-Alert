import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import KpiCard from '../components/KpiCard';
import Button from '../components/Button';
import { IGP_STATION_EXPLORER_ROWS } from '../utils/sampleData';
import {
  BarChart3,
  Database,
  MapPin,
  Play,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertTriangle,
  Flame,
  Snowflake
} from 'lucide-react';

export default function StationDataExplorer() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredRows = IGP_STATION_EXPLORER_ROWS.filter((r) => {
    if (selectedFilter === 'FROST') return r.scenario.includes('Helada');
    if (selectedFilter === 'YELLOW') return r.scenario.includes('Amarilla');
    if (selectedFilter === 'WARM') return r.scenario.includes('Sin Helada');
    return true;
  });

  const handleSimulateRow = (row) => {
    // Navigate to /predict and populate form
    navigate('/predict', {
      state: {
        prefill: {
          airTemp18: String(row.tt),
          relativeHumidity18: String(row.hr),
          pressure18: String(row.pp),
          windSpeed18: String(row.ff),
          windDirection18: String(row.dd),
          minTempToday: '2.5',
          date: `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`,
          notes: `Simulación directa desde registro histórico IGP Huancayo (${row.year}-${row.month}-${row.day})`
        }
      }
    });
  };

  return (
    <PageContainer
      title="Explorador de Datos EMA - IGP Huancayo"
      subtitle="Datos meteorológicos históricos de la Estación Automática del Observatorio de Huancayo (2018-2025)."
    >
      {/* Station Metadata KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Estación Meteorológica"
          value="Huancayo"
          subtitle="Observatorio IGP • 3,314 msnm"
          icon={MapPin}
          color="emerald"
        />
        <KpiCard
          title="Altitud en el Valle"
          value="3,314"
          unit="msnm"
          subtitle="Valle del Mantaro, Junín"
          icon={Database}
          color="cyan"
        />
        <KpiCard
          title="Años Registrados"
          value="2018 - 2025"
          subtitle="Más de 60,000 registros"
          icon={BarChart3}
          color="indigo"
        />
        <KpiCard
          title="Hora de Medición"
          value="6:00 PM"
          subtitle="Lectura clave del atardecer"
          icon={Snowflake}
          color="slate"
        />
      </div>

      {/* Filter and Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Registros Meteorológicos Históricos de Huancayo
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Elige cualquier día para cargar sus lecturas de las 6:00 PM y ver cómo reacciona el pronóstico de heladas.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Tipo:
          </span>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'FROST', label: 'Heladas Severas' },
            { id: 'YELLOW', label: 'Alertas Tempranas' },
            { id: 'WARM', label: 'Días Cálidos' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3.5">Fecha</th>
              <th className="py-3 px-3.5">Hora</th>
              <th className="py-3 px-3.5">Temp (TT)</th>
              <th className="py-3 px-3.5">Humedad (HR)</th>
              <th className="py-3 px-3.5">Presión (PP)</th>
              <th className="py-3 px-3.5">Viento (FF)</th>
              <th className="py-3 px-3.5">Dirección (DD)</th>
              <th className="py-3 px-3.5">Escenario Histórico</th>
              <th className="py-3 px-3.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredRows.map((r) => {
              const isFrost = r.scenario.includes('Severa');
              const isYellow = r.scenario.includes('Amarilla');

              return (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50 transition-colors text-slate-700"
                >
                  <td className="py-3 px-3.5 font-medium text-slate-900">
                    {r.year}-{String(r.month).padStart(2, '0')}-{String(r.day).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">
                    {String(r.hour).padStart(2, '0')}:00 h
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                    {r.tt.toFixed(2)} °C
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-700">
                    {r.hr.toFixed(1)} %
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">
                    {r.pp.toFixed(1)} hPa
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">
                    {r.ff.toFixed(2)} m/s
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">
                    {r.dd.toFixed(1)}°
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isFrost
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : isYellow
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {r.scenario}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Play}
                      onClick={() => handleSimulateRow(r)}
                    >
                      Simular en Predictor
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
