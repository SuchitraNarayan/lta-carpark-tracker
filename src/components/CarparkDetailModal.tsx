import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import {
  X,
  Navigation,
  Bookmark,
  Zap,
  Clock,
  Coins,
  ShieldAlert,
  Car,
  Bike,
  Truck,
  ExternalLink,
  Info,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  vehicleType: VehicleType;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  isFavorite,
  onToggleFavorite,
  vehicleType,
}) => {
  if (!carpark) return null;

  const currentLots = carpark.lots[vehicleType];
  const available = currentLots.available;
  const total = currentLots.total;
  const availablePct = total > 0 ? Math.round((available / total) * 100) : 0;

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-900">{carpark.agency}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.region}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.carparkType}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{carpark.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{carpark.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{carpark.address}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title={isFavorite ? 'Saved to bookmarks' : 'Save carpark'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Real-time Availability Hero Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                Live Lot Availability ({vehicleType.toUpperCase()})
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
                  {available}
                </span>
                <span className="text-sm font-mono text-slate-400">/ {total} Total Lots</span>
              </div>
              <span className="text-xs text-slate-300 mt-1 block">
                {availablePct}% capacity open · Last refreshed {new Date(carpark.lastUpdated).toLocaleTimeString('en-SG')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-xs whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Vehicle Category Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Lot Breakdown by Category
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <Car className="w-3.5 h-3.5" />
                  <span>Car Lots</span>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {carpark.lots.car.available} <span className="text-xs text-slate-500 font-normal">/ {carpark.lots.car.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <Bike className="w-3.5 h-3.5" />
                  <span>Motorcycles</span>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {carpark.lots.motorcycle.available} <span className="text-xs text-slate-500 font-normal">/ {carpark.lots.motorcycle.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Heavy Vehicles</span>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {carpark.lots.heavyVehicle.available} <span className="text-xs text-slate-500 font-normal">/ {carpark.lots.heavyVehicle.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Typical Occupancy Curve */}
          {carpark.hourlyPattern && carpark.hourlyPattern.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Typical Daily Occupancy Pattern
                </h4>
                <span className="text-[11px] text-slate-400">Singapore Standard Time (SGT)</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-end justify-between gap-2 h-24 pt-3">
                  {carpark.hourlyPattern.map((point) => (
                    <div key={point.hour} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="text-[10px] font-mono tabular-nums text-slate-500">
                        {point.occupancyPct}%
                      </div>
                      <div className="w-full bg-slate-200 h-16 rounded-t-sm flex items-end">
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            point.occupancyPct > 80
                              ? 'bg-rose-500'
                              : point.occupancyPct > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ height: `${point.occupancyPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">{point.hour}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Parking Tariff Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Parking Rates & Tariffs
              </h4>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Schedule</th>
                    <th className="px-4 py-2.5">Rate / Tariff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-700">Weekday Daytime (7am - 5pm)</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-900">{carpark.rates.weekdayDay}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-700">Weekday Night (after 5pm/6pm)</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-900">{carpark.rates.weekdayNight}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-700">Weekend Daytime</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-900">{carpark.rates.weekendDay}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-700">Weekend Night</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-900">{carpark.rates.weekendNight}</td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-700">Free Grace Period</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700 font-mono">
                      {carpark.rates.gracePeriodMinutes} Minutes (No charge if exit before)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Specifications & Amenities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Operating Rules & Height Restrictions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-500">Gantry Clearance Height</span>
                <span className="font-semibold font-mono text-slate-900">
                  {carpark.gantryHeight > 0 ? `${carpark.gantryHeight} meters` : 'No Height Barrier'}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-500">Parking System</span>
                <span className="font-semibold text-slate-900">{carpark.parkingSystem}</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-500">Short-Term Parking</span>
                <span className="font-semibold text-slate-900">{carpark.shortTermParking}</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-500">Free Parking Scheme</span>
                <span className="font-semibold text-emerald-700 truncate max-w-[180px]" title={carpark.freeParking}>
                  {carpark.freeParking}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>EV Charging Points</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {carpark.hasEVCharging
                    ? `Available (${carpark.evChargersCount || 4} Type 2 / CCS2 Fast Chargers)`
                    : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Coordinates: {carpark.coordinates.lat.toFixed(4)}° N, {carpark.coordinates.lng.toFixed(4)}° E</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
