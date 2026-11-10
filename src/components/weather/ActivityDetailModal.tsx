import React from 'react';
import { SportRecommendation } from '../../types/weather';
import {
  X,
  Droplets,
  Sun,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: SportRecommendation | null;
  onClose: () => void;
  heatIndex: number;
  currentUv: number;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  heatIndex,
  currentUv,
}) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-900">{activity.category} Sport</span>
              <span aria-hidden="true">·</span>
              <span>Singapore Environmental Assessment</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{activity.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{activity.summary}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Readiness Score Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                Activity Readiness Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
                  {activity.score}
                </span>
                <span className="text-sm font-mono text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 text-white inline-block">
                {activity.readiness.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Real-time multi-sensor evaluation
              </span>
            </div>
          </div>

          {/* Weather Impact Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Favorable */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Favorable Conditions
              </span>
              <ul className="space-y-1.5 text-emerald-800 text-[11px]">
                {activity.favorableFactors.map((fav, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">·</span>
                    <span>{fav}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks / Precautions */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Active Precautions
              </span>
              <ul className="space-y-1.5 text-amber-800 text-[11px]">
                {activity.riskFactors.length === 0 ? (
                  <li className="text-slate-500">No major environmental hazards active.</li>
                ) : (
                  activity.riskFactors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500">·</span>
                      <span>{risk}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Hydration & UV Protection Directives */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Thermal & Solar Protection Directives
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                <Droplets className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Hydration Cadence</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Drink 150ml - 200ml every{' '}
                    <strong className="font-mono text-slate-900">
                      {activity.hydrationIntervalMinutes} minutes
                    </strong>
                    . Add electrolyte powder if session exceeds 45 mins in {heatIndex}°C Heat Index.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Solar Radiation</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Current UV Index is <strong className="font-mono text-slate-900">{currentUv}</strong>
                    {currentUv >= 8
                      ? '. Broad spectrum SPF 50+ sunscreen, UV sunglasses, and headwear required.'
                      : '. Sunscreen recommended for sessions longer than 30 mins.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Gear */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Recommended Gear & Equipment
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {activity.recommendedGear.map((gear, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium"
                >
                  {gear}
                </span>
              ))}
            </div>
          </div>

          {/* Popular Singapore Venues */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Prime Venues & Park Connectors in Singapore
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activity.popularVenues.map((venue, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{venue.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">{venue.area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
