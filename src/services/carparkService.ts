import { INITIAL_CARPARKS } from '../data/singaporeCarparksData';
import { BackendConfig, Carpark, VehicleType } from '../types/carpark';

const STORAGE_FAVORITES_KEY = 'sg_carpark_favorites_v1';
const STORAGE_BACKEND_CONFIG_KEY = 'sg_carpark_backend_config_v1';

export const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  mode: 'mock',
  customEndpointUrl: '/api/carparkavailability',
  pollIntervalSec: 20,
  isSimulatingLiveDrift: true,
};

export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['MBS-01', 'HDB-TP24', 'ION-01'];
  } catch {
    return ['MBS-01', 'HDB-TP24'];
  }
}

export function saveStoredFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
}

export function getStoredBackendConfig(): BackendConfig {
  try {
    const raw = localStorage.getItem(STORAGE_BACKEND_CONFIG_KEY);
    return raw ? { ...DEFAULT_BACKEND_CONFIG, ...JSON.parse(raw) } : DEFAULT_BACKEND_CONFIG;
  } catch {
    return DEFAULT_BACKEND_CONFIG;
  }
}

export function saveStoredBackendConfig(config: BackendConfig): void {
  try {
    localStorage.setItem(STORAGE_BACKEND_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save backend config to localStorage', err);
  }
}

// Simulates live real-time lot changes (Singapore heartbeat: vehicles entering and leaving)
export function simulateRealtimeDrift(carparks: Carpark[]): Carpark[] {
  return carparks.map((cp) => {
    // 35% chance to drift this tick
    if (Math.random() > 0.45) return cp;

    const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const currentCarAvail = cp.lots.car.available;
    const maxCar = cp.lots.car.total;
    const newCarAvail = Math.max(0, Math.min(maxCar, currentCarAvail + delta));

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (newCarAvail > currentCarAvail) trend = 'increasing';
    else if (newCarAvail < currentCarAvail) trend = 'decreasing';

    return {
      ...cp,
      lots: {
        ...cp.lots,
        car: {
          ...cp.lots.car,
          available: newCarAvail,
        },
      },
      trend,
      lastUpdated: new Date().toISOString(),
    };
  });
}

// Calculate parking cost in Singapore Dollars (SGD)
export function calculateParkingEstimate(
  carpark: Carpark,
  vehicleType: VehicleType,
  durationMinutes: number,
  isSundayOrPublicHoliday: boolean = false
): {
  totalCost: number;
  graceApplied: boolean;
  breakdown: string;
} {
  // Grace period check
  if (durationMinutes <= carpark.rates.gracePeriodMinutes) {
    return {
      totalCost: 0,
      graceApplied: true,
      breakdown: `Grace period of ${carpark.rates.gracePeriodMinutes} mins applied (Free exit within grace).`,
    };
  }

  // Free Sunday check for HDB/URA
  if (isSundayOrPublicHoliday && carpark.freeParking.includes('SUN') && durationMinutes <= 900) {
    return {
      totalCost: 0,
      graceApplied: false,
      breakdown: `Free Parking Sunday/PH scheme active (${carpark.freeParking}).`,
    };
  }

  let rateMultiplier = 1;
  if (vehicleType === 'motorcycle') rateMultiplier = 0.35;
  if (vehicleType === 'heavyVehicle') rateMultiplier = 2.0;

  const halfHours = Math.ceil(durationMinutes / 30);
  const cost = halfHours * (carpark.rates.ratePerHalfHour * rateMultiplier);

  return {
    totalCost: Number(cost.toFixed(2)),
    graceApplied: false,
    breakdown: `${halfHours} block(s) of 30 mins @ $${(carpark.rates.ratePerHalfHour * rateMultiplier).toFixed(2)}/30m`,
  };
}
