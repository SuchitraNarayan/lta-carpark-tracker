import React, { useState } from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { calculateParkingEstimate } from '../services/carparkService';
import { X, Calculator, Car, Bike, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

interface RatesCalculatorModalProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onClose: () => void;
}

export const RatesCalculatorModal: React.FC<RatesCalculatorModalProps> = ({
  carparks,
  selectedCarpark,
  onClose,
}) => {
  const [chosenCarparkId, setChosenCarparkId] = useState<string>(
    selectedCarpark?.id || carparks[0]?.id || ''
  );
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [isSundayOrPH, setIsSundayOrPH] = useState<boolean>(false);

  const activeCarpark = carparks.find((c) => c.id === chosenCarparkId) || carparks[0];
  const totalMinutes = durationHours * 60 + durationMinutes;

  const result = activeCarpark
    ? calculateParkingEstimate(activeCarpark, vehicleType, totalMinutes, isSundayOrPH)
    : { totalCost: 0, graceApplied: false, breakdown: '' };

  // Comparison benchmark against standard HDB rate
  const hdbBaseline = activeCarpark
    ? calculateParkingEstimate(
        {
          ...activeCarpark,
          rates: {
            ...activeCarpark.rates,
            ratePerHalfHour: 0.60,
            gracePeriodMinutes: 15,
          },
          freeParking: 'SUN & PH 7:00 AM - 10:30 PM',
        },
        vehicleType,
        totalMinutes,
        isSundayOrPH
      )
    : { totalCost: 0, graceApplied: false, breakdown: '' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">SG Parking Rate Calculator</h3>
              <p className="text-xs text-slate-500">Instant tariff & duration cost breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Select Carpark */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Select Destination Carpark
            </label>
            <select
              value={chosenCarparkId}
              onChange={(e) => setChosenCarparkId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-medium focus:outline-hidden focus:border-slate-900"
            >
              {carparks.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.agency} · {c.town})
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Switch */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Vehicle Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                  vehicleType === 'car'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Car</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('motorcycle')}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                  vehicleType === 'motorcycle'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Motorcycle</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('heavyVehicle')}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                  vehicleType === 'heavyVehicle'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Heavy</span>
              </button>
            </div>
          </div>

          {/* Duration Inputs */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Parking Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sunday / Public Holiday Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
              <input
                type="checkbox"
                checked={isSundayOrPH}
                onChange={(e) => setIsSundayOrPH(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
              />
              <span>Sunday or Singapore Gazetted Public Holiday (Check Free Parking)</span>
            </label>
          </div>

          {/* Calculated Output Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white mt-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-slate-400 text-xs block">Estimated Fee</span>
                <div className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
                  ${result.totalCost.toFixed(2)} SGD
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <span>{totalMinutes} mins total</span>
                {result.graceApplied && (
                  <span className="block text-emerald-300 font-semibold">Grace Period Active</span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 border-t border-slate-800 pt-2 font-mono">
              {result.breakdown}
            </p>

            {activeCarpark && activeCarpark.agency === 'Commercial' && (
              <div className="text-[11px] text-slate-400 bg-slate-800/80 p-2.5 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Tip: Nearest HDB carpark would cost approximately{' '}
                  <strong className="text-white">${hdbBaseline.totalCost.toFixed(2)} SGD</strong>.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
