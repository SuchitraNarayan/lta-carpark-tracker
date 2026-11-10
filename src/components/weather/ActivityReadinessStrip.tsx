import React from 'react';
import {
  SportRecommendation,
  ActivityReadiness,
} from '../../types/weather';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Droplets,
  ShieldAlert,
  Sun,
  Wind,
} from 'lucide-react';

interface ActivityReadinessStripProps {
  recommendations: SportRecommendation[];
  onSelectActivity: (activity: SportRecommendation) => void;
  heatIndex: number;
  activeRainCount: number;
}

export const ActivityReadinessStrip: React.FC<ActivityReadinessStripProps> = ({
  recommendations,
  onSelectActivity,
  heatIndex,
  activeRainCount,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Outdoor & Sporting Activity Readiness</h2>
          <p className="text-xs text-slate-500">
            Real-time assessment combining wet-bulb thermal stress, lightning alert, UV radiation, and rain
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Caution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Hazardous</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recommendations.map((rec) => {
          const badgeStyle = getReadinessBadge(rec.readiness);

          return (
            <div
              key={rec.id}
              onClick={() => onSelectActivity(rec)}
              className="group bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header: Unboxed metadata with typographic separators */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{rec.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-slate-400">{rec.score}/100</span>
                  </div>

                  <span className={`text-[11px] font-bold ${badgeStyle.textColor}`}>
                    {badgeStyle.label}
                  </span>
                </div>

                {/* Title & Summary */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {rec.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {rec.summary}
                </p>

                {/* Highlight factors */}
                <div className="mt-3 space-y-1 text-xs">
                  {rec.riskFactors.slice(0, 1).map((risk, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <span className="line-clamp-1">{risk}</span>
                    </div>
                  ))}
                  {rec.riskFactors.length === 0 && rec.favorableFactors.slice(0, 1).map((fav, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                      <span className="line-clamp-1">{fav}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer: Hydration & View Guide */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Hydrate every <strong className="font-mono tabular-nums text-slate-700">{rec.hydrationIntervalMinutes}m</strong></span>
                </div>

                <div className="flex items-center gap-0.5 font-semibold text-slate-900 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                  <span>Full Guide</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getReadinessBadge(readiness: ActivityReadiness): {
  label: string;
  textColor: string;
} {
  switch (readiness) {
    case 'optimal':
      return { label: 'Optimal', textColor: 'text-emerald-700' };
    case 'good':
      return { label: 'Good to Go', textColor: 'text-blue-700' };
    case 'caution':
      return { label: 'Exercise Caution', textColor: 'text-amber-700' };
    case 'hazardous':
      return { label: 'Unfavorable / Hazard', textColor: 'text-rose-700' };
  }
}
