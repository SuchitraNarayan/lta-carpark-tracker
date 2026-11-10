import React from 'react';
import { DayForecast, TwentyFourHrData } from '../../types/weather';
import { Calendar, Compass, Droplets, Thermometer, Wind, CloudSun } from 'lucide-react';

interface ForecastOutlookProps {
  twentyFourHour: TwentyFourHrData;
  fourDayOutlook: DayForecast[];
}

export const ForecastOutlook: React.FC<ForecastOutlookProps> = ({
  twentyFourHour,
  fourDayOutlook,
}) => {
  return (
    <div className="space-y-4">
      {/* Section 1: 24-Hour Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>National Synoptic Forecast</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{twentyFourHour.validPeriodText}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">24-Hour Island Outlook</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>{twentyFourHour.tempLow}°C - {twentyFourHour.tempHigh}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{twentyFourHour.humidityLow}% - {twentyFourHour.humidityHigh}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-500" />
              <span>{twentyFourHour.windSpeed} ({twentyFourHour.windDirection})</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-100 font-medium">
          {twentyFourHour.generalSummary}
        </p>

        {/* Regional Period Table if available */}
        {twentyFourHour.periods && twentyFourHour.periods.length > 0 && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-slate-100">
              <thead>
                <tr className="text-slate-500 font-semibold">
                  <th className="py-2 pr-3">Time Window</th>
                  <th className="py-2 px-3">Central</th>
                  <th className="py-2 px-3">North</th>
                  <th className="py-2 px-3">South</th>
                  <th className="py-2 px-3">East</th>
                  <th className="py-2 pl-3">West</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {twentyFourHour.periods.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 pr-3 text-slate-900 font-semibold whitespace-nowrap">{p.timePeriod}</td>
                    <td className="py-2 px-3">{p.central}</td>
                    <td className="py-2 px-3">{p.north}</td>
                    <td className="py-2 px-3">{p.south}</td>
                    <td className="py-2 px-3">{p.east}</td>
                    <td className="py-2 pl-3">{p.west}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: 4-Day Extended Outlook */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">4-Day Singapore Extended Outlook</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {fourDayOutlook.map((day, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-slate-900">{day.day}</span>
                  <span className="font-mono">{day.date}</span>
                </div>

                <div className="my-2">
                  <span className="text-xs font-semibold text-slate-800 block">
                    {day.forecastText}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {day.summary}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Temperature</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {day.tempLow}°C - {day.tempHigh}°C
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Humidity</span>
                  <span className="tabular-nums">
                    {day.humidityLow}% - {day.humidityHigh}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Wind</span>
                  <span>{day.windSpeedLow}-{day.windSpeedHigh} km/h ({day.windDirection})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
