import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AreaForecast, WeatherStationReading } from '../../types/weather';
import { Locate, RotateCcw, Cloud, CloudRain, Sun, Zap, Layers } from 'lucide-react';

interface WeatherMapProps {
  forecasts: AreaForecast[];
  tempStations: WeatherStationReading[];
  rainStations: WeatherStationReading[];
  selectedArea: string | null;
  onSelectArea: (areaName: string) => void;
  validPeriod: string;
}

const SG_CENTER: [number, number] = [1.3521, 103.8198];
const SG_ZOOM = 12;

export const WeatherMap: React.FC<WeatherMapProps> = ({
  forecasts,
  tempStations,
  rainStations,
  selectedArea,
  onSelectArea,
  validPeriod,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeLayer, setActiveLayer] = useState<'forecast' | 'temperature' | 'rainfall'>('forecast');
  const [searchFilter, setSearchFilter] = useState('');

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SG_CENTER,
      zoom: SG_ZOOM,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    layerGroupRef.current = layer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = layerGroupRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (activeLayer === 'forecast') {
      forecasts.forEach((item) => {
        const isSelected = selectedArea?.toLowerCase() === item.area.toLowerCase();
        const iconConfig = getWeatherIconConfig(item.forecast);

        const html = `
          <div style="cursor: pointer;">
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 3px 6px;
              background-color: ${isSelected ? '#0f172a' : '#ffffff'};
              color: ${isSelected ? '#ffffff' : '#0f172a'};
              border: 1.5px solid ${isSelected ? '#0f172a' : iconConfig.borderColor};
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              box-shadow: ${isSelected ? '0 4px 12px rgba(15,23,42,0.3)' : '0 1px 4px rgba(0,0,0,0.1)'};
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: all 0.15s ease;
              white-space: nowrap;
            ">
              <span style="font-size: 12px;">${iconConfig.emoji}</span>
              <span>${item.area}</span>
            </div>
          </div>
        `;

        const marker = L.marker([item.latitude, item.longitude], {
          icon: L.divIcon({
            html,
            className: 'custom-weather-pin',
            iconSize: [80, 24],
            iconAnchor: [40, 12],
          }),
          zIndexOffset: isSelected ? 1000 : 0,
        });

        marker.on('click', () => {
          onSelectArea(item.area);
        });

        layer.addLayer(marker);
      });
    } else if (activeLayer === 'temperature') {
      tempStations.forEach((st) => {
        const temp = st.value;
        const color = temp >= 32 ? '#dc2626' : temp >= 30 ? '#d97706' : '#2563eb';

        const html = `
          <div style="cursor: pointer;">
            <div style="
              padding: 2px 6px;
              background-color: #ffffff;
              color: ${color};
              border: 1.5px solid ${color};
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              font-family: monospace;
              box-shadow: 0 1px 4px rgba(0,0,0,0.1);
              white-space: nowrap;
            ">
              ${temp}°C
            </div>
          </div>
        `;

        const marker = L.marker([st.latitude, st.longitude], {
          icon: L.divIcon({
            html,
            className: 'custom-temp-pin',
            iconSize: [44, 22],
            iconAnchor: [22, 11],
          }),
        });
        marker.bindPopup(`<strong>${st.stationName}</strong><br/>Air Temp: ${st.value}°C`);
        layer.addLayer(marker);
      });
    } else if (activeLayer === 'rainfall') {
      rainStations.forEach((st) => {
        const rain = st.value;
        const color = rain > 2 ? '#2563eb' : rain > 0 ? '#0284c7' : '#94a3b8';

        const html = `
          <div style="cursor: pointer;">
            <div style="
              padding: 2px 6px;
              background-color: ${rain > 0 ? '#eff6ff' : '#ffffff'};
              color: ${color};
              border: 1.5px solid ${color};
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              font-family: monospace;
              box-shadow: 0 1px 4px rgba(0,0,0,0.1);
              white-space: nowrap;
            ">
              ${rain > 0 ? `${rain}mm` : '0mm'}
            </div>
          </div>
        `;

        const marker = L.marker([st.latitude, st.longitude], {
          icon: L.divIcon({
            html,
            className: 'custom-rain-pin',
            iconSize: [44, 22],
            iconAnchor: [22, 11],
          }),
        });
        marker.bindPopup(`<strong>${st.stationName}</strong><br/>Rainfall: ${st.value} mm/h`);
        layer.addLayer(marker);
      });
    }
  }, [forecasts, tempStations, rainStations, selectedArea, activeLayer, onSelectArea]);

  // Pan when selectedArea changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedArea) return;
    const target = forecasts.find((f) => f.area.toLowerCase() === selectedArea.toLowerCase());
    if (target) {
      mapInstanceRef.current.flyTo([target.latitude, target.longitude], 14, { duration: 0.8 });
    }
  }, [selectedArea, forecasts]);

  const handleResetBounds = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(SG_CENTER, SG_ZOOM, { duration: 0.8 });
  };

  const selectedForecast = forecasts.find(
    (f) => f.area.toLowerCase() === selectedArea?.toLowerCase()
  );

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left: Layer Selector Tabs */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1 text-xs">
        <button
          onClick={() => setActiveLayer('forecast')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            activeLayer === 'forecast'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2-Hr Nowcast
        </button>
        <button
          onClick={() => setActiveLayer('temperature')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            activeLayer === 'temperature'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Temperature Radar
        </button>
        <button
          onClick={() => setActiveLayer('rainfall')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            activeLayer === 'rainfall'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rainfall Radar
        </button>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleResetBounds}
          className="p-2 bg-white text-slate-700 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 transition-colors"
          title="Reset to All Singapore"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Floating Info Preview */}
      {selectedForecast && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-20 bg-white p-3.5 rounded-xl border border-slate-200 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-slate-500 font-semibold">{validPeriod}</span>
            <span className="text-[11px] font-mono text-slate-400">
              {selectedForecast.latitude.toFixed(3)}°N, {selectedForecast.longitude.toFixed(3)}°E
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">{selectedForecast.area}</h4>
          <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-800">
            <span>{getWeatherIconConfig(selectedForecast.forecast).emoji}</span>
            <span>{selectedForecast.forecast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

function getWeatherIconConfig(forecastText: string): { emoji: string; borderColor: string } {
  const lower = forecastText.toLowerCase();
  if (lower.includes('thundery')) {
    return { emoji: '⛈️', borderColor: '#7c3aed' };
  }
  if (lower.includes('heavy')) {
    return { emoji: '🌧️', borderColor: '#2563eb' };
  }
  if (lower.includes('shower') || lower.includes('rain')) {
    return { emoji: '🌦️', borderColor: '#0284c7' };
  }
  if (lower.includes('cloudy')) {
    return { emoji: '⛅', borderColor: '#64748b' };
  }
  if (lower.includes('hazy') || lower.includes('mist')) {
    return { emoji: '🌫️', borderColor: '#94a3b8' };
  }
  return { emoji: '☀️', borderColor: '#f59e0b' };
}
