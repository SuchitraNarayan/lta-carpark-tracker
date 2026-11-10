import React, { useState, useEffect, useMemo } from 'react';
import { WeatherDataBundle, SportRecommendation } from '../../types/weather';
import { fetchLiveWeatherData, evaluateSportRecommendations } from '../../services/weatherService';
import { WeatherHeader } from './WeatherHeader';
import { ActivityReadinessStrip } from './ActivityReadinessStrip';
import { TelemetryGrid } from './TelemetryGrid';
import { WeatherMap } from './WeatherMap';
import { ForecastOutlook } from './ForecastOutlook';
import { ActivityDetailModal } from './ActivityDetailModal';
import { MapPin, Search, CloudRain, Sun, Thermometer, Wind, X } from 'lucide-react';

interface WeatherDashboardProps {
  onSwitchToCarpark: () => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ onSwitchToCarpark }) => {
  const [weather, setWeather] = useState<WeatherDataBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'activities' | 'map' | 'telemetry' | 'forecast'>('activities');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<SportRecommendation | null>(null);
  const [searchAreaQuery, setSearchAreaQuery] = useState('');

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    fetchLiveWeatherData().then((data) => {
      if (mounted) {
        setWeather(data);
        setLoading(false);
        setLastUpdated(new Date());
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const data = await fetchLiveWeatherData();
    setWeather(data);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Recommendations calculated against current selected area & weather
  const recommendations = useMemo(() => {
    if (!weather) return [];
    return evaluateSportRecommendations(weather, selectedArea || undefined);
  }, [weather, selectedArea]);

  const filteredAreas = useMemo(() => {
    if (!weather) return [];
    if (!searchAreaQuery) return weather.twoHourForecasts;
    return weather.twoHourForecasts.filter((f) =>
      f.area.toLowerCase().includes(searchAreaQuery.toLowerCase())
    );
  }, [weather, searchAreaQuery]);

  if (loading || !weather) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Connecting to Singapore Meteorological Feeds</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Loading 10 real-time v2 endpoints from Data.gov.sg (nowcasts, air temp, rain, UV, wind, PSI)...
        </p>
      </div>
    );
  }

  const currentAreaForecast = selectedArea
    ? weather.twoHourForecasts.find((f) => f.area.toLowerCase() === selectedArea.toLowerCase())
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <WeatherHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSwitchToCarpark={onSwitchToCarpark}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Top Singapore Microclimate Status Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
                {currentAreaForecast ? getWeatherEmoji(currentAreaForecast.forecast) : '🇸🇬'}
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                  <span>Singapore Standard Time (SGT)</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-700">
                    {selectedArea ? selectedArea : 'Island-wide Synopsis'}
                  </span>
                  {selectedArea && (
                    <button
                      onClick={() => setSelectedArea(null)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-1"
                    >
                      (Clear area)
                    </button>
                  )}
                </div>

                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentAreaForecast ? currentAreaForecast.forecast : weather.twentyFourHour.generalSummary}
                </h1>
              </div>
            </div>

            {/* Quick KPI pills with tabular numbers */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-bold text-slate-900">{weather.airTemperature.average}°C</span>
                <span className="text-[11px] text-slate-400">Feels {weather.heatIndexCelsius}°C</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-slate-900">UV {weather.uvIndex.currentValue}</span>
                <span className="text-[11px] text-slate-400">Peak {weather.uvIndex.peakToday}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-slate-900">
                  {weather.rainfall.highestRainfallMm > 0 ? `${weather.rainfall.highestRainfallMm}mm` : '0mm'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {weather.rainfall.activeRainStationsCount > 0 ? 'Showers' : 'Dry'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span className="font-bold text-slate-900">{weather.windSpeed.averageKmh} km/h</span>
                <span className="text-[11px] text-slate-400">Wind</span>
              </div>
            </div>
          </div>

          {/* Area quick pills for 47 Singapore zones */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs pb-1">
            <span className="text-slate-400 shrink-0 font-medium">Quick Areas:</span>
            {['Marina Bay', 'Sentosa', 'Bedok', 'Ang Mo Kio', 'Jurong East', 'Woodlands', 'Changi', 'Bukit Timah'].map(
              (area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(selectedArea === area ? null : area)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedArea === area
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {area}
                </button>
              )
            )}
          </div>
        </div>

        {/* Tab 1: Sport Readiness View */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <ActivityReadinessStrip
              recommendations={recommendations}
              onSelectActivity={setSelectedActivity}
              heatIndex={weather.heatIndexCelsius}
              activeRainCount={weather.rainfall.activeRainStationsCount}
            />

            <TelemetryGrid weather={weather} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[460px]">
              <div className="lg:col-span-8 h-[460px]">
                <WeatherMap
                  forecasts={weather.twoHourForecasts}
                  tempStations={weather.airTemperature.stations}
                  rainStations={weather.rainfall.stations}
                  selectedArea={selectedArea}
                  onSelectArea={setSelectedArea}
                  validPeriod={weather.twoHourValidPeriod}
                />
              </div>

              <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-800">47 Local Nowcast Areas</span>
                    <span className="font-mono">{weather.twoHourValidPeriod}</span>
                  </div>

                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter area (e.g. Kallang, Bedok)..."
                      value={searchAreaQuery}
                      onChange={(e) => setSearchAreaQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-900"
                    />
                  </div>

                  <div className="max-h-[310px] overflow-y-auto space-y-1 pr-1 text-xs">
                    {filteredAreas.map((f) => {
                      const isSel = selectedArea?.toLowerCase() === f.area.toLowerCase();
                      return (
                        <div
                          key={f.area}
                          onClick={() => setSelectedArea(isSel ? null : f.area)}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                            isSel ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{f.area}</span>
                          <span className="shrink-0 text-right text-[11px] opacity-80">{f.forecast}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  Click any area to pinpoint on map & recalculate sports ratings
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Map View */}
        {activeTab === 'map' && (
          <div className="h-[700px] w-full">
            <WeatherMap
              forecasts={weather.twoHourForecasts}
              tempStations={weather.airTemperature.stations}
              rainStations={weather.rainfall.stations}
              selectedArea={selectedArea}
              onSelectArea={setSelectedArea}
              validPeriod={weather.twoHourValidPeriod}
            />
          </div>
        )}

        {/* Tab 3: Detailed Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="space-y-5">
            <TelemetryGrid weather={weather} />
            <ForecastOutlook
              twentyFourHour={weather.twentyFourHour}
              fourDayOutlook={weather.fourDayOutlook}
            />
          </div>
        )}

        {/* Tab 4: Forecast Outlook */}
        {activeTab === 'forecast' && (
          <ForecastOutlook
            twentyFourHour={weather.twentyFourHour}
            fourDayOutlook={weather.fourDayOutlook}
          />
        )}
      </main>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        heatIndex={weather.heatIndexCelsius}
        currentUv={weather.uvIndex.currentValue}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SG SportCast Weather</span>
            <span aria-hidden="true">·</span>
            <span>Live meteorological telemetry for outdoor athletes & sports</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onSwitchToCarpark}
              className="hover:text-slate-900 transition-colors font-medium text-slate-600"
            >
              Switch to Carpark Tracker
            </button>
            <span className="font-mono text-slate-400">Data.gov.sg v2</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function getWeatherEmoji(forecast: string): string {
  const lower = forecast.toLowerCase();
  if (lower.includes('thundery')) return '⛈️';
  if (lower.includes('heavy')) return '🌧️';
  if (lower.includes('shower') || lower.includes('rain')) return '🌦️';
  if (lower.includes('cloudy')) return '⛅';
  if (lower.includes('hazy') || lower.includes('mist')) return '🌫️';
  return '☀️';
}
