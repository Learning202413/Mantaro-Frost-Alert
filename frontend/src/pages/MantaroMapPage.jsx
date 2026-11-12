import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polygon,
  Popup,
  Tooltip,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import PageContainer from '../components/PageContainer';
import KpiCard from '../components/KpiCard';
import Button from '../components/Button';
import {
  weatherService,
  MANTARO_CORRIDOR_ZONES
} from '../services/weatherService';
import {
  MapPin,
  Sparkles,
  Radio,
  Thermometer,
  ThermometerSnowflake,
  Wind,
  Droplets,
  Gauge,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Mountain,
  CloudRain
} from 'lucide-react';

// Valley center and bounding envelope
const MAP_CENTER = [-12.01, -75.33];
const DEFAULT_ZOOM = 11;

// Agricultural Corridor Polygon (3,150 - 3,450 m.a.s.l.)
// Encompasses Jauja, Concepción, Huancayo, and Chupaca along the Mantaro river basin
const CORRIDOR_POLYGON = [
  [-11.73, -75.53],
  [-11.75, -75.44],
  [-11.84, -75.34],
  [-11.90, -75.25],
  [-12.02, -75.17],
  [-12.11, -75.19],
  [-12.13, -75.26],
  [-12.08, -75.36],
  [-11.97, -75.37],
  [-11.85, -75.54],
  [-11.73, -75.53]
];

// Basemap Tile Providers (Free and Open - Zero API Key Required)
const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    label: 'Estándar',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Esri Satelital',
    label: 'Satelital',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, IGN, IGP'
  },
  topo: {
    name: 'Esri Topográfico',
    label: 'Relieve',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; USGS, FAO, NPS, NRCAN, GeoBase'
  }
};

/**
 * Controller to handle smooth map centering and invalidateSize
 */
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);

  return null;
}

/**
 * Evaluates thermal alert status from temperature in Celsius
 * 🔴 Red: <= 1.0°C (Helada Severa)
 * 🟡 Yellow: <= 2.0°C (Alerta Preventiva)
 * 🟢 Green: > 2.0°C (Sin Riesgo)
 */
function getThermalAlert(temp) {
  if (temp === null || temp === undefined || isNaN(temp)) {
    return {
      code: 'UNKNOWN',
      level: 'Consultando...',
      color: 'slate',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      dotColor: '#94a3b8',
      fillColor: '#64748b',
      pulseClass: 'border-slate-500',
      description: 'Consultando telemetría satelital en tiempo real.',
      mitigationAction: 'Sincronizando sensores...'
    };
  }

  if (temp <= 1.0) {
    return {
      code: 'SEVERE',
      level: 'Helada Severa',
      color: 'red',
      badgeClass: 'bg-red-950/80 text-red-300 border-red-500/50',
      dotColor: '#ef4444',
      fillColor: '#dc2626',
      pulseClass: 'border-red-500',
      description: 'Descenso térmico crítico por radiación terrestre bajo cielo despejado.',
      mitigationAction:
        'Activar riego por aspersión preventivo (02:00 AM) para aprovechar calor latente (80 cal/g) y desplegar cobertura térmica nocturna.'
    };
  }

  if (temp <= 2.0) {
    return {
      code: 'PREVENTIVE',
      level: 'Alerta Preventiva',
      color: 'amber',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      dotColor: '#f59e0b',
      fillColor: '#d97706',
      pulseClass: 'border-amber-500',
      description: 'Gradiente de enfriamiento acelerado al atardecer en el fondo del valle.',
      mitigationAction:
        'Monitoreo continuo de inversión térmica en hondonadas, verificación de compuertas y rondas de vigilancia térmica a las 22:00 h.'
    };
  }

  return {
    code: 'SAFE',
    level: 'Sin Riesgo',
    color: 'emerald',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    dotColor: '#10b981',
    fillColor: '#059669',
    pulseClass: 'border-emerald-500',
    description: 'Temperatura estable por encima del umbral de helada agrometeorológica.',
    mitigationAction:
      'Condición térmica controlada en el fondo del valle. Mantener régimen normal de monitoreo.'
  };
}

/**
 * Approximates dew point and depression using Magnus formula
 */
function getDewPointInfo(temp, rh) {
  if (temp === undefined || rh === undefined || isNaN(temp) || isNaN(rh) || rh <= 0) {
    return { dewPoint: '--', depression: '--', type: 'Normal' };
  }
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * temp) / (b + temp) + Math.log(rh / 100);
  const td = (b * alpha) / (a - alpha);
  const depression = temp - td;

  let type = 'Térmico Normal';
  if (td <= 0 && depression <= 2.5) {
    type = 'Escarcha Superficial (Helada Blanca)';
  } else if (td < 0 && rh < 48) {
    type = 'Helada Negra Radiativa (Aire Seco)';
  }

  return {
    dewPoint: td.toFixed(1),
    depression: depression.toFixed(1),
    type
  };
}

export default function MantaroMapPage() {
  const navigate = useNavigate();

  // State
  const [stationWeather, setStationWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState('chupaca');
  const [tileLayerKey, setTileLayerKey] = useState('osm');
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch real-time weather from Open-Meteo for all 4 stations concurrently
  const fetchCorridorWeather = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const results = await Promise.all(
        MANTARO_CORRIDOR_ZONES.map(async (zone) => {
          try {
            const data = await weatherService.getLiveWeatherForZone(zone.id);
            return { id: zone.id, data };
          } catch (err) {
            console.error(`Error al cargar datos para ${zone.name}:`, err);
            return { id: zone.id, data: null, error: err.message };
          }
        })
      );

      const weatherMap = {};
      results.forEach((item) => {
        if (item.data) {
          weatherMap[item.id] = item.data;
        }
      });

      setStationWeather(weatherMap);
      setLastSyncTime(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      setErrorMsg('No fue posible sincronizar los datos de todas las estaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorridorWeather();
  }, []);

  // Currently selected station & its weather
  const selectedStation = useMemo(() => {
    return (
      MANTARO_CORRIDOR_ZONES.find((z) => z.id === selectedStationId) ||
      MANTARO_CORRIDOR_ZONES[0]
    );
  }, [selectedStationId]);

  const selectedWeather = stationWeather[selectedStation.id];
  const selectedAlert = getThermalAlert(selectedWeather?.TT_18);
  const selectedDewPoint = getDewPointInfo(selectedWeather?.TT_18, selectedWeather?.HR_18);

  // Top KPIs computed across all corridor stations
  const kpiData = useMemo(() => {
    const temps = Object.values(stationWeather)
      .map((w) => w?.T_min_today)
      .filter((t) => t !== undefined && !isNaN(t));

    const minProjected = temps.length > 0 ? Math.min(...temps) : 8.1;

    // Check predominant alert
    let severeCount = 0;
    let preventiveCount = 0;
    Object.values(stationWeather).forEach((w) => {
      const alert = getThermalAlert(w?.TT_18);
      if (alert.code === 'SEVERE') severeCount++;
      if (alert.code === 'PREVENTIVE') preventiveCount++;
    });

    let valleyAlert = 'Sin Riesgo';
    let valleyColor = 'emerald';
    if (severeCount > 0) {
      valleyAlert = `${severeCount} Estación(es) Helada Severa`;
      valleyColor = 'red';
    } else if (preventiveCount > 0) {
      valleyAlert = `${preventiveCount} Estación(es) Alerta Preventiva`;
      valleyColor = 'amber';
    }

    return {
      minProjected: minProjected.toFixed(1),
      valleyAlert,
      valleyColor
    };
  }, [stationWeather]);

  // Handler to load selected station into the evening predictor
  const handleLoadInPredictor = () => {
    navigate('/predict', {
      state: {
        zone: selectedStation,
        weather: selectedWeather
      }
    });
  };

  return (
    <PageContainer
      title="Mapa Interactivo del Valle del Mantaro"
      subtitle="Monitoreo del clima en vivo para agricultores • Corredor agrícola central (3,150 – 3,450 msnm)"
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchCorridorWeather}
            loading={loading}
          >
            Actualizar Satélite
          </Button>
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="px-2 text-slate-400 font-mono text-[11px]">Capa:</span>
            {Object.entries(TILE_LAYERS).map(([key, layer]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTileLayerKey(key)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  tileLayerKey === key
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer.label || layer.name}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {/* =========================================================================
          TOP KPI CARDS (CORRIDOR OVERVIEW)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Estaciones del Valle"
          value="4"
          subtitle="Chupaca • Huancayo • Concepción • Jauja"
          icon={Radio}
          color="emerald"
        />

        <KpiCard
          title="Riesgo de Helada en el Valle"
          value={kpiData.valleyAlert}
          subtitle="Monitoreo del fondo del valle"
          icon={ShieldAlert}
          color={kpiData.valleyColor}
        />

        <KpiCard
          title="Temperatura Más Fría Esperada"
          value={kpiData.minProjected}
          unit="°C"
          subtitle={lastSyncTime ? `Actualizado: ${lastSyncTime}` : 'Consultando modelos...'}
          icon={ThermometerSnowflake}
          color="cyan"
        />

        <KpiCard
          title="Altitud de los Campos"
          value="3,150 – 3,450"
          unit="msnm"
          subtitle="Zona agrícola de Huancayo y el valle"
          icon={Mountain}
          color="slate"
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          MAIN INTERACTIVE MAP & DETAIL DRAWER GRID
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEAFLET MAP CONTAINER (7 cols on large screens) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
          {/* Map Header Toolbar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
                Geovisualizador de Estaciones • Cuenca del Mantaro
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
              <span className="flex items-center gap-1 text-red-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                &le; 1°C
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                &le; 2°C
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                &gt; 2°C
              </span>
            </div>
          </div>

          {/* Leaflet Map Area */}
          <div className="h-[340px] sm:h-[420px] lg:h-[520px] w-full relative z-0">
            <MapContainer
              center={MAP_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              className="h-full w-full"
              style={{ background: '#f8fafc' }}
            >
              <MapController
                center={[selectedStation.latitude, selectedStation.longitude]}
                zoom={DEFAULT_ZOOM}
              />

              <TileLayer
                url={TILE_LAYERS[tileLayerKey].url}
                attribution={TILE_LAYERS[tileLayerKey].attribution}
              />

              {/* Valley Agricultural Corridor Polygon */}
              <Polygon
                positions={CORRIDOR_POLYGON}
                pathOptions={{
                  color: '#059669',
                  weight: 2,
                  dashArray: '6, 6',
                  fillColor: '#10b981',
                  fillOpacity: 0.12
                }}
              >
                <Tooltip sticky direction="center">
                  <div className="font-sans text-[11px] font-bold text-emerald-950">
                    Corredor Agrícola Mantaro (3,150 – 3,450 msnm)
                  </div>
                </Tooltip>
              </Polygon>

              {/* Station CircleMarkers with dynamic pulsing indicators */}
              {MANTARO_CORRIDOR_ZONES.map((station) => {
                const weather = stationWeather[station.id];
                const alert = getThermalAlert(weather?.TT_18);
                const isSelected = selectedStation.id === station.id;

                return (
                  <React.Fragment key={station.id}>
                    {/* Outer halo pulsing circle */}
                    <CircleMarker
                      center={[station.latitude, station.longitude]}
                      radius={isSelected ? 26 : 18}
                      pathOptions={{
                        color: alert.dotColor,
                        fillColor: alert.dotColor,
                        fillOpacity: isSelected ? 0.35 : 0.2,
                        weight: isSelected ? 2 : 1
                      }}
                    />

                    {/* Core interactive CircleMarker */}
                    <CircleMarker
                      center={[station.latitude, station.longitude]}
                      radius={isSelected ? 14 : 10}
                      pathOptions={{
                        color: isSelected ? '#ffffff' : alert.dotColor,
                        fillColor: alert.fillColor,
                        fillOpacity: 0.95,
                        weight: isSelected ? 3 : 2
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedStationId(station.id);
                        }
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                        <div className="font-sans text-xs text-slate-900 leading-tight">
                          <div className="font-bold flex items-center gap-1">
                            {station.name.split(' (')[0]}
                            {station.isReference && (
                              <span className="text-[9px] bg-emerald-700 text-white px-1 rounded font-mono">
                                IGP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-700 mt-0.5">
                            TT 18:00: <strong>{weather?.TT_18 !== undefined ? `${weather.TT_18} °C` : '--'}</strong>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-600">
                            {alert.level} • {station.elevation} msnm
                          </div>
                        </div>
                      </Tooltip>

                      <Popup className="custom-dark-popup">
                        <div className="p-1 text-slate-900 font-sans text-xs">
                          <div className="font-bold text-sm text-emerald-900">{station.name}</div>
                          <div className="text-slate-600 text-[11px]">{station.station}</div>
                          <div className="mt-2 pt-1 border-t border-slate-200 grid grid-cols-2 gap-1 font-mono text-[11px]">
                            <div>TT 18:00: <strong>{weather?.TT_18 ?? '--'} °C</strong></div>
                            <div>HR 18:00: <strong>{weather?.HR_18 ?? '--'} %</strong></div>
                            <div>Presión: <strong>{weather?.PP_18 ?? '--'} hPa</strong></div>
                            <div>Viento: <strong>{weather?.FF_18 ?? '--'} m/s</strong></div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedStationId(station.id)}
                            className="mt-2.5 w-full py-1 text-center bg-emerald-600 text-white rounded font-medium text-[11px] hover:bg-emerald-700 cursor-pointer"
                          >
                            Ver Detalles y Telemetría
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          {/* Station Quick Selector Bar below map */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MANTARO_CORRIDOR_ZONES.map((zone) => {
              const weather = stationWeather[zone.id];
              const alert = getThermalAlert(weather?.TT_18);
              const isSelected = selectedStation.id === zone.id;

              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedStationId(zone.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 truncate">
                      {zone.name.split(' (')[0]}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: alert.dotColor }}
                    />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between font-mono">
                    <span className="text-xs text-emerald-800 font-bold">
                      {weather?.TT_18 !== undefined ? `${weather.TT_18}°C` : '--'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {zone.elevation}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAIL DRAWER / CARD (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-left">
            {/* Header: Station identity */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedStation.name}
                  </h3>
                  {selectedStation.isReference && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      BASE IGP
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStation.station} • UBIGEO: {selectedStation.ubigeo}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1 text-[10px] sm:text-[11px] text-slate-500 font-mono">
                  <span>Prov. {selectedStation.province}</span>
                  <span>•</span>
                  <span>{selectedStation.elevation} msnm</span>
                  <span>•</span>
                  <span>{selectedStation.latitude.toFixed(4)}°, {selectedStation.longitude.toFixed(4)}°</span>
                </div>
              </div>

              {/* Thermal Alert Badge */}
              <div className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-bold shrink-0 ${selectedAlert.badgeClass}`}>
                {selectedAlert.level}
              </div>
            </div>

            {/* Thermal Alert Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diagnóstico Térmico Vespertino:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedAlert.description}
              </p>
            </div>

            {/* Real-time Telemetry Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Métricas en Vivo (Corte 18:00 h)
                </span>
                <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                  Open-Meteo Satelital
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* TT 18:00 */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Temp. Aire (TT 18h)</span>
                  </div>
                  <div className="mt-1 text-lg font-bold font-mono text-slate-900">
                    {selectedWeather?.TT_18 !== undefined ? `${selectedWeather.TT_18} °C` : '--'}
                  </div>
                  <span className="text-[10px] text-slate-500">Sensor a 2m del suelo</span>
                </div>

                {/* HR 18:00 */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>Humedad Relativa</span>
                  </div>
                  <div className="mt-1 text-lg font-bold font-mono text-slate-900">
                    {selectedWeather?.HR_18 !== undefined ? `${selectedWeather.HR_18} %` : '--'}
                  </div>
                  <span className="text-[10px] text-slate-500">Corte sincrónico</span>
                </div>

                {/* Surface Pressure */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Presión Barométrica</span>
                  </div>
                  <div className="mt-1 text-lg font-bold font-mono text-slate-900">
                    {selectedWeather?.PP_18 !== undefined ? `${selectedWeather.PP_18} hPa` : '--'}
                  </div>
                  <span className="text-[10px] text-slate-500">Presión normal andina</span>
                </div>

                {/* Wind */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Wind className="w-3.5 h-3.5 text-teal-600" />
                    <span>Velocidad de Viento</span>
                  </div>
                  <div className="mt-1 text-lg font-bold font-mono text-slate-900">
                    {selectedWeather?.FF_18 !== undefined ? `${selectedWeather.FF_18} m/s` : '--'}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Dir: {selectedWeather?.DD_18 !== undefined ? `${selectedWeather.DD_18}°` : '--'}
                  </span>
                </div>

                {/* Min Temp Today */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Mínima de Hoy</span>
                  </div>
                  <div className="mt-1 text-base font-bold font-mono text-slate-900">
                    {selectedWeather?.T_min_today !== undefined ? `${selectedWeather.T_min_today} °C` : '--'}
                  </div>
                  <span className="text-[10px] text-slate-500">00:00 – 07:00 h</span>
                </div>

                {/* Precipitation */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                    <span>Lluvia Tarde / 24h</span>
                  </div>
                  <div className="mt-1 text-base font-bold font-mono text-slate-900">
                    {selectedWeather?.RR_afternoon ?? '0.0'} / {selectedWeather?.RR_24h ?? '0.0'} mm
                  </div>
                  <span className="text-[10px] text-slate-500">Efecto protector de lluvia</span>
                </div>
              </div>
            </div>

            {/* Dew Point Analysis */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">
                  Punto de Rocío: {selectedDewPoint.dewPoint} °C
                </span>
                <span className="text-[11px] font-mono text-slate-600">
                  Sequedad: {selectedDewPoint.depression} °C
                </span>
              </div>
              <p className="text-[11px] text-slate-700">
                Condición: <strong>{selectedDewPoint.type}</strong>.
              </p>
            </div>

            {/* Thermal Mitigation Protocol */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                <span>Recomendaciones para el Agricultor</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedAlert.mitigationAction}
              </p>
            </div>

            {/* Primary Action Button: Load into PredictEvening */}
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                icon={Sparkles}
                onClick={handleLoadInPredictor}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs py-3 rounded-xl cursor-pointer"
              >
                ⚡ Usar estos datos para pronosticar mañana
              </Button>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Transfiere automáticamente las lecturas de {selectedStation.name.split(' (')[0]} al motor inteligente de pronóstico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
