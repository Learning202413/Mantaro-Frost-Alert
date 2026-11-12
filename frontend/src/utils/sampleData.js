/**
 * Datos meteorológicos de muestra de la estación meteorológica del Observatorio IGP Huancayo
 * (Latitud: -12.04, Longitud: -75.32, Altitud: 3314 msnm)
 * Calibrado para agricultores y técnicos del Valle del Mantaro.
 */

export const PRESET_SCENARIOS = [
  {
    id: 'severe-frost',
    shortTitle: 'Noche de Helada Fuerte (-1.5°C)',
    name: '🔴 Noche de Helada Fuerte (-1.5°C)',
    targetTemp: '-1.5 °C',
    level: 'ROJO',
    description: 'Noche de invierno muy seca y con cielo despejado. El calor del suelo escapa rápidamente hacia el espacio.',
    badge: 'ROJO • Alerta Máxima',
    badgeClass: 'bg-red-500/15 text-red-200 border-red-500/40 hover:bg-red-500/25',
    data: {
      airTemp18: 9.27,
      relativeHumidity18: 49.0,
      pressure18: 688.6,
      windSpeed18: 3.0,
      windDirection18: 303.4,
      minTempToday: 1.2,
      rrAfternoon: 0.0,
      date: '2026-06-25',
      notes: 'Registro histórico real: noche despejada de invierno en el valle del Mantaro (IGP Huancayo).'
    }
  },
  {
    id: 'typical-cold',
    shortTitle: 'Noche Fría con Escarcha (+1.2°C)',
    name: '🟡 Noche Fría con Escarcha (+1.2°C)',
    targetTemp: '+1.2 °C',
    level: 'AMARILLO',
    description: 'Atardecer fresco con humedad moderada. Peligro de escarcha en las partes bajas y hondonadas del valle.',
    badge: 'AMARILLO • Prevención',
    badgeClass: 'bg-amber-500/15 text-amber-200 border-amber-500/40 hover:bg-amber-500/25',
    data: {
      airTemp18: 10.8,
      relativeHumidity18: 58.5,
      pressure18: 687.2,
      windSpeed18: 1.8,
      windDirection18: 270.0,
      minTempToday: 3.5,
      rrAfternoon: 0.0,
      date: '2026-05-18',
      notes: 'Caso de advertencia: escarcha matutina en parcelas bajas de Chupaca y Sicaya.'
    }
  },
  {
    id: 'warm-no-frost',
    shortTitle: 'Noche Templada y Segura (+4.5°C)',
    name: '🟢 Noche Templada y Segura (+4.5°C)',
    targetTemp: '+4.5 °C',
    level: 'VERDE',
    description: 'Cielo con nubes protectoras y humedad alta tras lluvia ligera. Los cultivos están seguros.',
    badge: 'VERDE • Seguro',
    badgeClass: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/25',
    data: {
      airTemp18: 13.89,
      relativeHumidity18: 70.1,
      pressure18: 685.3,
      windSpeed18: 0.93,
      windDirection18: 112.1,
      minTempToday: 7.4,
      rrAfternoon: 2.5,
      date: '2026-02-17',
      notes: 'Noche húmeda: las nubes retienen el calor y no hay riesgo de congelación.'
    }
  }
];

export const IGP_STATION_EXPLORER_ROWS = [
  { id: 1, year: 2022, month: 6, day: 25, hour: 18, tt: 9.27, hr: 49.0, pp: 688.6, ff: 3.00, dd: 303.4, rr: 0.0, scenario: 'Helada Severa' },
  { id: 2, year: 2023, month: 6, day: 2,  hour: 18, tt: 8.54, hr: 28.7, pp: 687.2, ff: 1.51, dd: 254.5, rr: 0.0, scenario: 'Helada Severa' },
  { id: 3, year: 2023, month: 7, day: 14, hour: 18, tt: 8.80, hr: 33.2, pp: 689.1, ff: 1.20, dd: 260.0, rr: 0.0, scenario: 'Helada Severa' },
  { id: 4, year: 2021, month: 7, day: 5,  hour: 18, tt: 9.10, hr: 42.0, pp: 687.9, ff: 2.10, dd: 280.0, rr: 0.0, scenario: 'Helada Severa' },
  { id: 5, year: 2022, month: 5, day: 18, hour: 18, tt: 10.80, hr: 58.5, pp: 687.2, ff: 1.80, dd: 270.0, rr: 0.0, scenario: 'Alerta Amarilla' },
  { id: 6, year: 2023, month: 5, day: 29, hour: 18, tt: 10.20, hr: 52.0, pp: 686.8, ff: 1.40, dd: 245.0, rr: 0.0, scenario: 'Alerta Amarilla' },
  { id: 7, year: 2024, month: 8, day: 10, hour: 18, tt: 11.10, hr: 48.0, pp: 688.0, ff: 2.40, dd: 290.0, rr: 0.0, scenario: 'Alerta Amarilla' },
  { id: 8, year: 2018, month: 1, day: 16, hour: 18, tt: 12.82, hr: 71.8, pp: 684.6, ff: 1.65, dd: 122.8, rr: 2.1, scenario: 'Sin Helada' },
  { id: 9, year: 2018, month: 2, day: 5,  hour: 18, tt: 12.52, hr: 75.3, pp: 684.2, ff: 2.73, dd: 111.3, rr: 5.4, scenario: 'Sin Helada' },
  { id: 10, year: 2018, month: 2, day: 17, hour: 18, tt: 13.89, hr: 70.1, pp: 685.3, ff: 0.93, dd: 112.1, rr: 0.5, scenario: 'Sin Helada' },
  { id: 11, year: 2018, month: 11, day: 1, hour: 18, tt: 12.03, hr: 70.9, pp: 686.2, ff: 4.20, dd: 233.9, rr: 0.0, scenario: 'Sin Helada' },
  { id: 12, year: 2019, month: 1, day: 12, hour: 18, tt: 12.13, hr: 80.2, pp: 684.8, ff: 2.18, dd: 37.2, rr: 4.2, scenario: 'Sin Helada' }
];
