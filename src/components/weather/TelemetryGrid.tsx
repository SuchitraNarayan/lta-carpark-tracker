import React from 'react';
import { WeatherDataBundle } from '../../types/weather';
import {
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Gauge,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface TelemetryGridProps {
  weather: WeatherDataBundle;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({ weather }) => {
  const avgTemp = weather.airTemperature.average;
  const minTemp = weather.airTemperature.min;
  const maxTemp = weather.airTemperature.max;
  const heatIndex = weather.heatIndexCelsius;

  const rainCount = weather.rainfall.activeRainStationsCount;
  const maxRainMm = weather.rainfall.highestRainfallMm;

  const uvVal = weather.uvIndex.currentValue;
  const uvPeak = weather.uvIndex.peakToday;

  const humidity = weather.relativeHumidity.average;

  const windKmh = weather.windSpeed.averageKmh;
  const windKnots = weather.windSpeed.averageKnots;
  const maxWindKmh = weather.windSpeed.maxKmh;

  const psiReadings = weather.psi.readings;
  const psiMax = Math.max(
    psiReadings.north,
    psiReadings.south,
    psiReadings.east,
    psiReadings.west,
    psiReadings.central
  );

  const pm25Max = Math.max(
    weather.pm25.readings.north,
    weather.pm25.readings.south,
    weather.pm25.readings.east,
    weather.pm25.readings.west,
    weather.pm25.readings.central
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Live Environmental Telemetry</h2>
          <p className="text-xs text-slate-500">
            Real-time sensory readings from meteorological stations across Singapore
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Last updated: {new Date(weather.timestamp).toLocaleTimeString('en-SG')}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Sensor 1: Air Temperature & Heat Index */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Air Temperature</span>
              <Thermometer className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {avgTemp}°C
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Feels like <strong className="font-mono text-slate-800">{heatIndex}°C</strong>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 mt-2">
            Min {minTemp}° · Max {maxTemp}°
          </div>
        </div>

        {/* Sensor 2: Rainfall */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Rainfall Status</span>
              <CloudRain className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {maxRainMm > 0 ? `${maxRainMm}` : '0.0'}
              </span>
              <span className="text-xs font-mono text-slate-500">mm/h</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {rainCount > 0 ? (
                <span className="text-blue-600 font-semibold">{rainCount} stations wet</span>
              ) : (
                <span className="text-emerald-600 font-semibold">Dry islandwide</span>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 mt-2">
            {rainCount > 0 ? 'Passing showers detected' : 'Zero precipitation recorded'}
          </div>
        </div>

        {/* Sensor 3: UV Radiation */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Solar UV Index</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {uvVal}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 15</span>
            </div>
            <div className="text-[11px] font-semibold mt-0.5">
              {uvVal >= 8 ? (
                <span className="text-rose-600">Very High (SPF 50+)</span>
              ) : uvVal >= 6 ? (
                <span className="text-amber-600">High Protection</span>
              ) : uvVal >= 3 ? (
                <span className="text-blue-600">Moderate</span>
              ) : (
                <span className="text-emerald-600">Low Exposure</span>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 mt-2">
            Peak today: UV {uvPeak}
          </div>
        </div>

        {/* Sensor 4: Relative Humidity */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Humidity</span>
              <Droplets className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {humidity}%
              </span>
              <span className="text-xs font-mono text-slate-500">RH</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {humidity > 85 ? 'Very Muggy' : humidity > 70 ? 'Typical Tropical' : 'Comfortable'}
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${humidity}%` }} />
          </div>
        </div>

        {/* Sensor 5: Wind Speed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Wind Speed</span>
              <Wind className="w-4 h-4 text-teal-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {windKmh}
              </span>
              <span className="text-xs font-mono text-slate-500">km/h</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {windKnots} knots
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 mt-2">
            Gusts up to {maxWindKmh} km/h
          </div>
        </div>

        {/* Sensor 6: Air Quality (PSI & PM2.5) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Air Quality</span>
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {psiMax}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-mono">PSI (24h)</span>
              </div>
              <div className="border-l border-slate-200 pl-2">
                <span className="text-lg font-bold font-mono tabular-nums text-slate-700">
                  {pm25Max}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-mono">PM2.5 (1h)</span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {weather.psi.status} Condition
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 mt-2 truncate">
            N:{psiReadings.north} S:{psiReadings.south} E:{psiReadings.east} W:{psiReadings.west}
          </div>
        </div>
      </div>
    </div>
  );
};
