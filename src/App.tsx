import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_CARPARKS } from './data/singaporeCarparksData';
import { BackendConfig, Carpark, CarparkFilterState, VehicleType } from './types/carpark';
import {
  DEFAULT_BACKEND_CONFIG,
  getStoredBackendConfig,
  getStoredFavorites,
  saveStoredBackendConfig,
  saveStoredFavorites,
  simulateRealtimeDrift,
} from './services/carparkService';
import { Header } from './components/Header';
import { CityStatsStrip } from './components/CityStatsStrip';
import { FilterToolbar } from './components/FilterToolbar';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { RatesCalculatorModal } from './components/RatesCalculatorModal';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { WeatherDashboard } from './components/weather/WeatherDashboard';
import { Inbox, Compass, Search } from 'lucide-react';

export default function App() {
  const [activeApp, setActiveApp] = useState<'weather' | 'carpark'>('weather');
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailCarpark, setDetailCarpark] = useState<Carpark | null>(null);
  const [isRatesCalcOpen, setIsRatesCalcOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites());
  const [backendConfig, setBackendConfig] = useState<BackendConfig>(getStoredBackendConfig());
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState<CarparkFilterState>({
    searchQuery: '',
    agency: 'All',
    region: 'All',
    vehicleType: 'car',
    minAvailableLots: 0,
    onlyEV: false,
    onlyFreeParking: false,
    onlyNightParking: false,
    minHeightClearance: 0,
    sortBy: 'availability',
    viewMode: 'split',
    showFavoritesOnly: false,
  });

  // Favorite toggle
  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveStoredFavorites(next);
      return next;
    });
  }, []);

  // Update backend config
  const handleSaveBackendConfig = useCallback((newConfig: BackendConfig) => {
    setBackendConfig(newConfig);
    saveStoredBackendConfig(newConfig);
  }, []);

  // Live real-time drift interval
  useEffect(() => {
    if (backendConfig.mode === 'mock' && backendConfig.isSimulatingLiveDrift) {
      const interval = setInterval(() => {
        setCarparks((prev) => simulateRealtimeDrift(prev));
        setLastSyncTime(new Date());
      }, backendConfig.pollIntervalSec * 1000);

      return () => clearInterval(interval);
    }
  }, [backendConfig.mode, backendConfig.isSimulatingLiveDrift, backendConfig.pollIntervalSec]);

  // Manual sync refresh
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (backendConfig.mode === 'custom' && backendConfig.customEndpointUrl) {
      try {
        const response = await fetch(backendConfig.customEndpointUrl);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.carparks) && data.carparks.length > 0) {
            setCarparks(data.carparks);
          }
        }
      } catch (err) {
        console.warn('Custom backend fetch fallback to local simulation', err);
      }
    } else {
      // Simulate network latency then drift
      await new Promise((r) => setTimeout(r, 450));
      setCarparks((prev) => simulateRealtimeDrift(prev));
    }
    setLastSyncTime(new Date());
    setIsRefreshing(false);
  }, [backendConfig]);

  // Test custom endpoint connection for backend modal
  const handleTriggerTestFetch = useCallback(
    async (url: string): Promise<{ success: boolean; message: string; count?: number }> => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          return {
            success: false,
            message: `Endpoint returned HTTP status ${res.status} (${res.statusText})`,
          };
        }
        const data = await res.json();
        const count = Array.isArray(data.carparks)
          ? data.carparks.length
          : Array.isArray(data)
          ? data.length
          : 0;
        return {
          success: true,
          message: `Connected successfully! Retrieved ${count} carparks.`,
          count,
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Could not reach ${url}: ${err?.message || 'Network error / CORS issue'}`,
        };
      }
    },
    []
  );

  // Filter & sort carparks
  const filteredCarparks = useMemo(() => {
    return carparks
      .filter((cp) => {
        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = cp.name.toLowerCase().includes(q);
          const matchAddress = cp.address.toLowerCase().includes(q);
          const matchTown = cp.town.toLowerCase().includes(q);
          const matchId = cp.id.toLowerCase().includes(q);
          if (!matchName && !matchAddress && !matchTown && !matchId) return false;
        }

        // Region
        if (filters.region !== 'All' && cp.region !== filters.region) return false;

        // Agency
        if (filters.agency !== 'All' && cp.agency !== filters.agency) return false;

        // Only EV
        if (filters.onlyEV && !cp.hasEVCharging) return false;

        // Only Free Parking
        if (filters.onlyFreeParking && cp.freeParking === 'None') return false;

        // Only Night Parking
        if (filters.onlyNightParking && !cp.nightParking) return false;

        // Favorites only
        if (filters.showFavoritesOnly && !favorites.includes(cp.id)) return false;

        return true;
      })
      .sort((a, b) => {
        const aLots = a.lots[filters.vehicleType];
        const bLots = b.lots[filters.vehicleType];

        if (filters.sortBy === 'availability') {
          return bLots.available - aLots.available;
        }
        if (filters.sortBy === 'occupancyRate') {
          const aOcc = aLots.total > 0 ? (aLots.total - aLots.available) / aLots.total : 0;
          const bOcc = bLots.total > 0 ? (bLots.total - bLots.available) / bLots.total : 0;
          return aOcc - bOcc; // lowest occupancy first
        }
        if (filters.sortBy === 'rateAsc') {
          return a.rates.ratePerHalfHour - b.rates.ratePerHalfHour;
        }
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [carparks, filters, favorites]);

  // Keep selected carpark updated when carpark state refreshes
  useEffect(() => {
    if (selectedCarpark) {
      const updated = carparks.find((c) => c.id === selectedCarpark.id);
      if (updated) setSelectedCarpark(updated);
    }
    if (detailCarpark) {
      const updated = carparks.find((c) => c.id === detailCarpark.id);
      if (updated) setDetailCarpark(updated);
    }
  }, [carparks]);

  const handleFilterChange = (updates: Partial<CarparkFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      agency: 'All',
      region: 'All',
      vehicleType: 'car',
      minAvailableLots: 0,
      onlyEV: false,
      onlyFreeParking: false,
      onlyNightParking: false,
      minHeightClearance: 0,
      sortBy: 'availability',
      viewMode: filters.viewMode,
      showFavoritesOnly: false,
    });
  };

  if (activeApp === 'weather') {
    return <WeatherDashboard onSwitchToCarpark={() => setActiveApp('carpark')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* 3-Zone Top Bar */}
      <Header
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastSyncTime}
        onOpenCalculator={() => setIsRatesCalcOpen(true)}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        viewMode={filters.viewMode}
        onViewModeChange={(mode) => setFilters((prev) => ({ ...prev, viewMode: mode }))}
        favoritesCount={favorites.length}
        showFavoritesOnly={filters.showFavoritesOnly}
        onToggleFavoritesOnly={() =>
          setFilters((prev) => ({ ...prev, showFavoritesOnly: !prev.showFavoritesOnly }))
        }
        onSwitchToWeather={() => setActiveApp('weather')}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Island-wide Metric Strip */}
        <CityStatsStrip carparks={carparks} vehicleType={filters.vehicleType} />

        {/* Search, Region & Quick Filters Bar */}
        <FilterToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalCarparksCount={carparks.length}
          filteredCount={filteredCarparks.length}
        />

        {/* View Mode Layouts */}
        {filters.viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[580px]">
            {/* Left Column: Interactive Leaflet Map */}
            <div className="lg:col-span-7 h-[420px] lg:h-[680px] sticky top-20">
              <CarparkMap
                carparks={filteredCarparks}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={setSelectedCarpark}
                vehicleType={filters.vehicleType}
                onOpenDetails={setDetailCarpark}
              />
            </div>

            {/* Right Column: Scrollable List of Carpark Cards */}
            <div className="lg:col-span-5 flex flex-col h-auto lg:h-[680px]">
              <div className="text-xs font-semibold text-slate-500 mb-2 px-1 flex items-center justify-between">
                <span>
                  Stations in View ({filteredCarparks.length})
                </span>
                <span className="text-slate-400 font-normal">
                  Click to locate on map
                </span>
              </div>

              {filteredCarparks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No carparks match your filter</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Try broadening your search term or turning off specific agency / EV filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {filteredCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      vehicleType={filters.vehicleType}
                      isSelected={selectedCarpark?.id === cp.id}
                      isFavorite={favorites.includes(cp.id)}
                      onSelect={(target) => setSelectedCarpark(target)}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenDetails={(target) => setDetailCarpark(target)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {filters.viewMode === 'map' && (
          <div className="h-[750px] w-full">
            <CarparkMap
              carparks={filteredCarparks}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={setSelectedCarpark}
              vehicleType={filters.vehicleType}
              onOpenDetails={setDetailCarpark}
            />
          </div>
        )}

        {filters.viewMode === 'list' && (
          <div>
            {filteredCarparks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center">
                <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No carparks found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust your search keyword or clear active filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    vehicleType={filters.vehicleType}
                    isSelected={selectedCarpark?.id === cp.id}
                    isFavorite={favorites.includes(cp.id)}
                    onSelect={(target) => setSelectedCarpark(target)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetails={(target) => setDetailCarpark(target)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Carpark Full Details Modal */}
      <CarparkDetailModal
        carpark={detailCarpark}
        onClose={() => setDetailCarpark(null)}
        isFavorite={detailCarpark ? favorites.includes(detailCarpark.id) : false}
        onToggleFavorite={handleToggleFavorite}
        vehicleType={filters.vehicleType}
      />

      {/* Rates Calculator Modal */}
      {isRatesCalcOpen && (
        <RatesCalculatorModal
          carparks={carparks}
          selectedCarpark={selectedCarpark}
          onClose={() => setIsRatesCalcOpen(false)}
        />
      )}

      {/* Backend Integration Bridge Modal */}
      {isBackendModalOpen && (
        <BackendIntegrationModal
          config={backendConfig}
          onSaveConfig={handleSaveBackendConfig}
          onClose={() => setIsBackendModalOpen(false)}
          onTriggerTestFetch={handleTriggerTestFetch}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SG Carpark Live Tracker</span>
            <span aria-hidden="true">·</span>
            <span>Real-time availability for HDB, URA & Commercial Carparks</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="hover:text-slate-900 transition-colors font-medium text-slate-600"
            >
              Backend API Connect
            </button>
            <button
              onClick={() => setIsRatesCalcOpen(true)}
              className="hover:text-slate-900 transition-colors font-medium text-slate-600"
            >
              Rates Calculator
            </button>
            <span className="font-mono text-slate-400">Singapore (SGT)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
