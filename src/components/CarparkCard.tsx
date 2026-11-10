import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { Bookmark, Navigation, ChevronRight, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark;
  vehicleType: VehicleType;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (carpark: Carpark) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (carpark: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  vehicleType,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onOpenDetails,
}) => {
  const lotInfo = carpark.lots[vehicleType];
  const available = lotInfo.available;
  const total = lotInfo.total;
  const occupancyPct = total > 0 ? Math.round(((total - available) / total) * 100) : 100;
  const availablePct = total > 0 ? Math.round((available / total) * 100) : 0;

  // Status color based on remaining availability
  let statusColorText = 'text-emerald-700';
  let barColor = 'bg-emerald-500';
  let statusLabel = 'High Availability';
  if (availablePct < 10 || available <= 5) {
    statusColorText = 'text-rose-700';
    barColor = 'bg-rose-500';
    statusLabel = 'Critical / Almost Full';
  } else if (availablePct < 25 || available <= 30) {
    statusColorText = 'text-amber-700';
    barColor = 'bg-amber-500';
    statusLabel = 'Limited Lots';
  }

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`group relative bg-white rounded-xl border transition-all duration-150 p-4 cursor-pointer hover:border-slate-300 ${
        isSelected
          ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
          : 'border-slate-200 shadow-xs'
      }`}
    >
      {/* Top Header: Unboxed metadata with typographic separators (Zero-Pill discipline) */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-slate-700">{carpark.agency}</span>
          <span aria-hidden="true">·</span>
          <span>{carpark.region}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-400">{carpark.id}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(carpark.id);
          }}
          className="p-1 text-slate-400 hover:text-amber-500 transition-colors shrink-0"
          title={isFavorite ? 'Remove from saved' : 'Save carpark'}
        >
          <Bookmark
            className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`}
          />
        </button>
      </div>

      {/* Carpark Title & Location */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {carpark.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
          {carpark.address}
        </p>
      </div>

      {/* Real-time Occupancy Gauge */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {available}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {total} available
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {carpark.trend === 'increasing' && (
              <span className="flex items-center text-emerald-600 font-medium" title="Lots freeing up">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                Freeing
              </span>
            )}
            {carpark.trend === 'decreasing' && (
              <span className="flex items-center text-rose-600 font-medium" title="Filling up fast">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                Filling
              </span>
            )}
            {carpark.trend === 'stable' && (
              <span className="flex items-center text-slate-400" title="Stable rate">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                Steady
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(4, (available / Math.max(1, total)) * 100))}%` }}
          />
        </div>

        {/* Unboxed Status & Rate description */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-200/60">
          <span className={`font-semibold ${statusColorText}`}>
            {statusLabel} ({availablePct}% free)
          </span>
          <span className="truncate max-w-[170px] text-slate-600 text-right">
            {carpark.rates.weekdayDay}
          </span>
        </div>
      </div>

      {/* Quick Amenities & Action row */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          {carpark.hasEVCharging && (
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <Zap className="w-3 h-3" />
              {carpark.evChargersCount ? `${carpark.evChargersCount} EV` : 'EV'}
            </span>
          )}
          <span>H: {carpark.gantryHeight}m</span>
          {carpark.freeParking !== 'None' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium truncate max-w-[110px]" title={carpark.freeParking}>
                Free Sun/PH
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(carpark);
          }}
          className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
