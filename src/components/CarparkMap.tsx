import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Carpark, VehicleType } from '../types/carpark';
import { Locate, RotateCcw, Zap, ExternalLink } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  vehicleType: VehicleType;
  onOpenDetails: (carpark: Carpark) => void;
}

const SG_CENTER: [number, number] = [1.3521, 103.8198];
const SG_DEFAULT_ZOOM = 12;

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  vehicleType,
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SG_CENTER,
      zoom: SG_DEFAULT_ZOOM,
      zoomControl: false,
    });

    // Clean, crisp Positron map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers when carparks, selectedCarpark, or vehicleType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    carparks.forEach((cp) => {
      const lotData = cp.lots[vehicleType];
      const available = lotData.available;
      const total = lotData.total;
      const pct = total > 0 ? (available / total) * 100 : 0;

      // Color tier
      let statusColor = '#10b981'; // green
      let bgColor = '#ecfdf5';
      let borderColor = '#059669';
      if (pct < 10 || available <= 5) {
        statusColor = '#ef4444'; // red
        bgColor = '#fef2f2';
        borderColor = '#dc2626';
      } else if (pct < 25 || available <= 30) {
        statusColor = '#f59e0b'; // amber
        bgColor = '#fffbeb';
        borderColor = '#d97706';
      }

      const isSelected = selectedCarpark?.id === cp.id;

      const htmlContent = `
        <div class="pin-wrapper" style="cursor: pointer;">
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 6px;
            background-color: ${isSelected ? '#0f172a' : bgColor};
            color: ${isSelected ? '#ffffff' : '#0f172a'};
            border: 1.5px solid ${isSelected ? '#0f172a' : borderColor};
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
            box-shadow: ${isSelected ? '0 4px 12px rgba(15,23,42,0.35)' : '0 2px 5px rgba(0,0,0,0.1)'};
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            transition: all 0.2s ease;
            white-space: nowrap;
          ">
            <span style="
              width: 7px;
              height: 7px;
              border-radius: 9999px;
              background-color: ${statusColor};
              display: inline-block;
            "></span>
            <span>${available}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: htmlContent,
        className: 'custom-carpark-pin',
        iconSize: [46, 26],
        iconAnchor: [23, 13],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0,
      });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      layer.addLayer(marker);
    });
  }, [carparks, selectedCarpark, vehicleType, onSelectCarpark]);

  // Pan to selected carpark if specified
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCarpark) return;
    mapInstanceRef.current.flyTo(
      [selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng],
      15,
      { duration: 0.8 }
    );
  }, [selectedCarpark]);

  const handleResetBounds = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(SG_CENTER, SG_DEFAULT_ZOOM, { duration: 0.8 });
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 0.8 });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(coords);
          } else {
            const userIcon = L.divIcon({
              html: `
                <div style="
                  width: 14px;
                  height: 14px;
                  border-radius: 9999px;
                  background-color: #2563eb;
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 0 4px rgba(37,99,235,0.3);
                "></div>
              `,
              className: 'custom-user-pin',
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            });
            userMarkerRef.current = L.marker(coords, { icon: userIcon }).addTo(mapInstanceRef.current);
          }
        }
      },
      () => {
        setIsLocating(false);
        // Fallback to Singapore CBD
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(SG_CENTER, SG_DEFAULT_ZOOM);
        }
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          className="p-2 bg-white text-slate-700 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 transition-colors"
          title="Find Current Location"
        >
          <Locate className={`w-4 h-4 ${isLocating ? 'animate-pulse text-blue-600' : ''}`} />
        </button>

        <button
          onClick={handleResetBounds}
          className="p-2 bg-white text-slate-700 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 transition-colors"
          title="Reset to All Singapore"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Indicator */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs text-slate-600 flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>&gt;30% Free</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>10-30%</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>&lt;10% Lots</span>
        </div>
      </div>

      {/* Selected Carpark Bottom Card Preview */}
      {selectedCarpark && (
        <div className="absolute top-3 left-3 right-14 sm:right-auto sm:max-w-sm z-20 bg-white p-3.5 rounded-xl border border-slate-200 shadow-md transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <span>{selectedCarpark.agency}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedCarpark.carparkType}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{selectedCarpark.id}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {selectedCarpark.name}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {selectedCarpark.address}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {selectedCarpark.lots[vehicleType].available}
              </span>
              <span className="text-[10px] block text-slate-500">
                / {selectedCarpark.lots[vehicleType].total} lots
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-600 truncate">
              {selectedCarpark.rates.weekdayDay}
            </span>
            <button
              onClick={() => onOpenDetails(selectedCarpark)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Full Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
