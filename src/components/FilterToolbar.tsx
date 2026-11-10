import React from 'react';
import { Search, Car, Bike, Truck, SlidersHorizontal, Zap, ShieldCheck, Moon, X } from 'lucide-react';
import { CarparkAgency, CarparkFilterState, CarparkRegion, VehicleType } from '../types/carpark';

interface FilterToolbarProps {
  filters: CarparkFilterState;
  onFilterChange: (newFilters: Partial<CarparkFilterState>) => void;
  onResetFilters: () => void;
  totalCarparksCount: number;
  filteredCount: number;
}

const REGIONS: (CarparkRegion | 'All')[] = ['All', 'Central', 'East', 'West', 'North', 'North-East'];
const AGENCIES: (CarparkAgency | 'All')[] = ['All', 'HDB', 'URA', 'Commercial', 'LTA'];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalCarparksCount,
  filteredCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5">
      {/* Search Bar + Vehicle Type Segmented Control */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search carparks by name, estate, street, or code (e.g. ION, Tampines, TP24)..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Vehicle Type Segmented Switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => onFilterChange({ vehicleType: 'car' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filters.vehicleType === 'car'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Cars</span>
          </button>
          <button
            onClick={() => onFilterChange({ vehicleType: 'motorcycle' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filters.vehicleType === 'motorcycle'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Motorcycles</span>
          </button>
          <button
            onClick={() => onFilterChange({ vehicleType: 'heavyVehicle' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filters.vehicleType === 'heavyVehicle'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Heavy</span>
          </button>
        </div>
      </div>

      {/* Filter Row 2: Region Tabs + Agency Tabs + Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Regions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium mr-1">Region:</span>
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => onFilterChange({ region })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filters.region === region
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Agency Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium mr-1">Agency:</span>
          {AGENCIES.map((agency) => (
            <button
              key={agency}
              onClick={() => onFilterChange({ agency })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filters.agency === agency
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {agency}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="sort-select" className="text-slate-400 font-medium">Sort by:</label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as CarparkFilterState['sortBy'] })}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-hidden focus:border-slate-900"
          >
            <option value="availability">Highest Lots Available</option>
            <option value="occupancyRate">Lowest Occupancy %</option>
            <option value="rateAsc">Lowest Tariff / Rate</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Row 3: Feature Toggles + Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onFilterChange({ onlyEV: !filters.onlyEV })}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors ${
              filters.onlyEV
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>EV Charging</span>
          </button>

          <button
            onClick={() => onFilterChange({ onlyFreeParking: !filters.onlyFreeParking })}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors ${
              filters.onlyFreeParking
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Free Parking Scheme</span>
          </button>

          <button
            onClick={() => onFilterChange({ onlyNightParking: !filters.onlyNightParking })}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors ${
              filters.onlyNightParking
                ? 'bg-purple-50 border-purple-300 text-purple-700 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night Parking Cap</span>
          </button>

          {(filters.searchQuery ||
            filters.region !== 'All' ||
            filters.agency !== 'All' ||
            filters.onlyEV ||
            filters.onlyFreeParking ||
            filters.onlyNightParking ||
            filters.showFavoritesOnly) && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-1"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-mono tabular-nums text-slate-900">{filteredCount}</span> of{' '}
          <span className="font-mono tabular-nums">{totalCarparksCount}</span> carparks
        </div>
      </div>
    </div>
  );
};
