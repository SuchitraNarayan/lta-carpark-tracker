import React from 'react';
import { RefreshCw, Activity, MapPin, Gauge, Calendar, Car } from 'lucide-react';

interface WeatherHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  activeTab: 'activities' | 'map' | 'telemetry' | 'forecast';
  onTabChange: (tab: 'activities' | 'map' | 'telemetry' | 'forecast') => void;
  onSwitchToCarpark: () => void;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  onRefresh,
  isRefreshing,
  lastUpdated,
  activeTab,
  onTabChange,
  onSwitchToCarpark,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
            SG
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            SG SportCast Weather
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-line, clean typography) */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => onTabChange('activities')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'activities'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sport Readiness</span>
            </button>

            <button
              onClick={() => onTabChange('map')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Island Radar Map</span>
            </button>

            <button
              onClick={() => onTabChange('telemetry')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-amber-600" />
              <span>Sensors & Telemetry</span>
            </button>

            <button
              onClick={() => onTabChange('forecast')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'forecast'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>4-Day Outlook</span>
            </button>
          </div>

          <button
            onClick={onSwitchToCarpark}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            title="Switch to Singapore Carpark Live Tracker"
          >
            <Car className="w-3.5 h-3.5 text-slate-500" />
            <span>Carpark Tracker</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex flex-col items-end text-[11px] text-slate-500 leading-tight">
            <span>Data.gov.sg v2 live</span>
            <span className="font-mono tabular-nums text-slate-400">
              {lastUpdated.toLocaleTimeString('en-SG', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-xs whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Sync Weather'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
