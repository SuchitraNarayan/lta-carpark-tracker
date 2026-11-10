import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { Car, Zap, Activity, ShieldCheck, Sparkles } from 'lucide-react';

interface CityStatsStripProps {
  carparks: Carpark[];
  vehicleType: VehicleType;
}

export const CityStatsStrip: React.FC<CityStatsStripProps> = ({ carparks, vehicleType }) => {
  const totalCarparks = carparks.length;

  const totalLots = carparks.reduce((acc, c) => acc + c.lots[vehicleType].total, 0);
  const availableLots = carparks.reduce((acc, c) => acc + c.lots[vehicleType].available, 0);
  const occupancyRate = totalLots > 0 ? Math.round(((totalLots - availableLots) / totalLots) * 100) : 0;
  const availableRate = totalLots > 0 ? Math.round((availableLots / totalLots) * 100) : 0;

  const totalEv = carparks.reduce((acc, c) => acc + (c.evChargersCount || 0), 0);
  const freeParkingCount = carparks.filter((c) => c.freeParking !== 'None').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Metric 1 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Island Availability</span>
          <Activity className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {availableLots.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-slate-400">/ {totalLots.toLocaleString()}</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          <span className="font-semibold text-emerald-600">{availableRate}% free</span> across {totalCarparks} stations
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Current Occupancy</span>
          <Car className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {occupancyRate}%
          </span>
          <span className="text-xs text-slate-500">Filled</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-slate-900 rounded-full"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Fast EV Chargers</span>
          <Zap className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-blue-600">
            {totalEv}
          </span>
          <span className="text-xs text-slate-500">Poles</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Type 2 & CCS2 fast charge enabled
        </div>
      </div>

      {/* Metric 4 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Free Parking Schemes</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {freeParkingCount}
          </span>
          <span className="text-xs text-slate-500">Locations</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          HDB / URA Sunday & Lunch windows
        </div>
      </div>
    </div>
  );
};
