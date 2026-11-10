import React from 'react';
import { RefreshCw, MapPin, Calculator, Code2, Bookmark, Layers } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  onOpenCalculator: () => void;
  onOpenBackendModal: () => void;
  viewMode: 'split' | 'map' | 'list';
  onViewModeChange: (mode: 'split' | 'map' | 'list') => void;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  lastUpdated,
  onOpenCalculator,
  onOpenBackendModal,
  viewMode,
  onViewModeChange,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element, no subtitle badge) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
            SG
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            SG Carpark Live Tracker
          </span>
        </div>

        {/* Zone 2: Navigation Links & View Controls (Single-line, clean typography) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Split Map & List View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Full Map View"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Data Table View"
            >
              <span>Carparks List</span>
            </button>
          </div>

          <button
            onClick={onToggleFavoritesOnly}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
              showFavoritesOnly ? 'text-amber-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Saved ({favoritesCount})</span>
          </button>

          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Calculator className="w-4 h-4" />
            <span>Rates Estimator</span>
          </button>

          <button
            onClick={onOpenBackendModal}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Code2 className="w-4 h-4" />
            <span>Backend API Config</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Live Sync / Refresh) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex flex-col items-end text-[11px] text-slate-500 leading-tight">
            <span>Live sync active</span>
            <span className="font-mono tabular-nums text-slate-400">
              {lastUpdated.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-xs whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
